import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-64aa-4b6f-b003-9c74b97cee20';

@RegisteredInstanceCommand('2.12.0', 1780579070012)
export class DropIsCustomFromObjectAndFieldMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN IF EXISTS "isCustom"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "isCustom"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "isCustom" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" ADD COLUMN IF NOT EXISTS "isCustom" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      `UPDATE "core"."objectMetadata" "objectMetadata"
       SET "isCustom" = ("objectMetadata"."applicationId" <> "standardApplication"."id")
       FROM "core"."application" "standardApplication"
       WHERE "standardApplication"."workspaceId" = "objectMetadata"."workspaceId"
         AND "standardApplication"."universalIdentifier" = '${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}'`,
    );
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata" "fieldMetadata"
       SET "isCustom" = ("fieldMetadata"."applicationId" <> "standardApplication"."id")
       FROM "core"."application" "standardApplication"
       WHERE "standardApplication"."workspaceId" = "fieldMetadata"."workspaceId"
         AND "standardApplication"."universalIdentifier" = '${TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER}'`,
    );
  }
}
