import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const EMPTY_PLAINTEXT = '' as PlaintextString;

const LEGACY_EMPTY_VALUE = '' as EncryptedString;

@RegisteredInstanceCommand('2.31.0', 1786533438000, { type: 'slow' })
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
    await this.encryptEmptyRegistrationVariables(dataSource);
    await this.encryptEmptyApplicationVariables(dataSource);
  }

  private async encryptEmptyRegistrationVariables(
    dataSource: DataSource,
  ): Promise<void> {
    const applicationRegistrationVariableRepository = dataSource.getRepository(
      ApplicationRegistrationVariableEntity,
    );

    const { affected } = await applicationRegistrationVariableRepository.update(
      { encryptedValue: LEGACY_EMPTY_VALUE },
      {
        encryptedValue:
          this.secretEncryptionService.encryptVersioned(EMPTY_PLAINTEXT),
      },
    );

    this.logger.log(
      `core.applicationRegistrationVariable: encrypted ${affected ?? 0} empty value(s)`,
    );
  }

  // The encryption key is derived from the workspaceId, so each workspace
  // needs its own envelope of the empty string.
  private async encryptEmptyApplicationVariables(
    dataSource: DataSource,
  ): Promise<void> {
    const applicationVariableRepository = dataSource.getRepository(
      ApplicationVariableEntity,
    );

    const workspaceRows = await applicationVariableRepository
      .createQueryBuilder('applicationVariable')
      .select('applicationVariable.workspaceId', 'workspaceId')
      .where('applicationVariable.value = :legacyEmptyValue', {
        legacyEmptyValue: LEGACY_EMPTY_VALUE,
      })
      .distinct(true)
      .getRawMany<{ workspaceId: string }>();

    let encryptedCount = 0;

    for (const { workspaceId } of workspaceRows) {
      const { affected } = await applicationVariableRepository.update(
        { workspaceId, value: LEGACY_EMPTY_VALUE },
        {
          value: this.secretEncryptionService.encryptVersioned(
            EMPTY_PLAINTEXT,
            { workspaceId },
          ),
        },
      );

      encryptedCount += affected ?? 0;
    }

    this.logger.log(
      `core.applicationVariable: encrypted ${encryptedCount} empty value(s)`,
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
