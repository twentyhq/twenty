import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const BACKFILL_BATCH_SIZE = 500;

const FIRST_CURSOR = '00000000-0000-0000-0000-000000000000';

const BACKFILL_TARGETS = [
  {
    tableName: 'applicationVariable',
    valueColumnName: 'value',
    isWorkspaceScoped: true,
  },
  {
    tableName: 'applicationRegistrationVariable',
    valueColumnName: 'encryptedValue',
    isWorkspaceScoped: false,
  },
] as const;

type BackfillTarget = (typeof BACKFILL_TARGETS)[number];

@RegisteredInstanceCommand('2.31.0', 1786459992777, { type: 'slow' })
export class EncryptEmptyApplicationVariablesSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    EncryptEmptyApplicationVariablesSlowInstanceCommand.name,
  );

  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const backfillTarget of BACKFILL_TARGETS) {
      await this.encryptEmptyValues(dataSource, backfillTarget);
    }
  }

  private async encryptEmptyValues(
    dataSource: DataSource,
    { tableName, valueColumnName, isWorkspaceScoped }: BackfillTarget,
  ): Promise<void> {
    const workspaceIdSelection = isWorkspaceScoped ? ', "workspaceId"' : '';
    let encryptedCount = 0;
    let cursor: string = FIRST_CURSOR;

    while (true) {
      const rows: { id: string; workspaceId?: string }[] =
        await dataSource.query(
          `SELECT id${workspaceIdSelection}
           FROM "core"."${tableName}"
          WHERE id > $1
            AND "${valueColumnName}" = ''
          ORDER BY id
          LIMIT $2`,
          [cursor, BACKFILL_BATCH_SIZE],
        );

      if (rows.length === 0) {
        break;
      }

      for (const row of rows) {
        await dataSource.query(
          `UPDATE "core"."${tableName}" SET "${valueColumnName}" = $2 WHERE id = $1 AND "${valueColumnName}" = ''`,
          [
            row.id,
            this.secretEncryptionService.encryptVersioned(
              '' as PlaintextString,
              isWorkspaceScoped ? { workspaceId: row.workspaceId } : {},
            ),
          ],
        );
        encryptedCount++;
      }

      cursor = rows[rows.length - 1].id;
    }

    this.logger.log(
      `core.${tableName}: encrypted ${encryptedCount} empty value(s)`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationVariable_value_encrypted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "CHK_applicationVariable_value_encrypted" CHECK ("value" LIKE 'enc:v2:%')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ALTER COLUMN "value" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationRegistrationVariable_encryptedValue_encrypted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ADD CONSTRAINT "CHK_applicationRegistrationVariable_encryptedValue_encrypted" CHECK ("encryptedValue" LIKE 'enc:v2:%')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ALTER COLUMN "encryptedValue" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ALTER COLUMN "encryptedValue" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationRegistrationVariable_encryptedValue_encrypted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ADD CONSTRAINT "CHK_applicationRegistrationVariable_encryptedValue_encrypted" CHECK ("encryptedValue" = '' OR "encryptedValue" LIKE 'enc:v2:%')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ALTER COLUMN "value" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationVariable_value_encrypted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "CHK_applicationVariable_value_encrypted" CHECK ("value" = '' OR "value" LIKE 'enc:v2:%')`,
    );
  }
}
