import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKSLASH = '\\';

// A server running natively on Windows stored file paths joined with
// backslashes. Storage keys are now always built with forward slashes, so
// those rows would no longer be found. Rows on POSIX hosts never contain a
// backslash and are untouched.
@RegisteredInstanceCommand('2.46.0', 1790963995688, { type: 'slow' })
export class NormalizeWindowsFilePathsSlowInstanceCommand implements SlowInstanceCommand {
  private readonly logger = new Logger(
    NormalizeWindowsFilePathsSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    // A row whose normalized path is already taken was re-uploaded after the
    // fix, and two legacy rows can normalize to the same path. Updating either
    // would violate a file path unique constraint and fail the whole upgrade,
    // so only the first row per normalized path is updated and only when the
    // path is free. NULL scopes are compared as equal, which skips more than
    // the constraints require rather than less.
    await dataSource.query(
      `WITH "legacyFile" AS (
         SELECT
           id,
           "workspaceId",
           "applicationId",
           "applicationRegistrationId",
           replace(path, $1, '/') AS "normalizedPath",
           row_number() OVER (
             PARTITION BY
               "workspaceId",
               "applicationId",
               "applicationRegistrationId",
               replace(path, $1, '/')
             ORDER BY "createdAt", id
           ) AS "rank"
         FROM "core"."file"
         WHERE strpos(path, $1) > 0
       )
       UPDATE "core"."file" AS "file"
       SET path = "legacyFile"."normalizedPath"
       FROM "legacyFile"
       WHERE "file".id = "legacyFile".id
         AND "legacyFile"."rank" = 1
         AND NOT EXISTS (
           SELECT 1 FROM "core"."file" AS "existingFile"
           WHERE "existingFile".path = "legacyFile"."normalizedPath"
             AND (
               (
                 "existingFile"."applicationId" IS NOT DISTINCT FROM "legacyFile"."applicationId"
                 AND "existingFile"."workspaceId" IS NOT DISTINCT FROM "legacyFile"."workspaceId"
               )
               OR "existingFile"."applicationRegistrationId" = "legacyFile"."applicationRegistrationId"
             )
         )`,
      [BACKSLASH],
    );

    const [{ count: skippedCount }] = await dataSource.query(
      `SELECT count(*)::int AS count FROM "core"."file" WHERE strpos(path, $1) > 0`,
      [BACKSLASH],
    );

    if (skippedCount > 0) {
      this.logger.warn(
        `${skippedCount} file row(s) kept their backslash path because the normalized path is already used`,
      );
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Forward slashes are valid on every platform and the original separators
  // are not recorded, so there is nothing meaningful to restore.
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
