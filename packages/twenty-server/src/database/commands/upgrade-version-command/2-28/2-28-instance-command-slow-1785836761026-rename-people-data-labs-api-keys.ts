import { isDefined } from 'twenty-shared/utils';
import {
  DataSource,
  In,
  IsNull,
  QueryRunner,
  type EntityManager,
} from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER =
  '4a1178c1-3535-4a47-b592-231d3216b36f';

const LEGACY_APP_KEY = 'PDL_API_KEY';
const RENAMED_APP_KEY = 'PEOPLE_DATA_LABS_APP_API_KEY';

const LEGACY_ENGINE_KEY = 'PEOPLE_DATA_LABS_API_KEY';
const RENAMED_ENGINE_KEY = 'PEOPLE_DATA_LABS_ENGINE_API_KEY';

@RegisteredInstanceCommand('2.28.0', 1785836761026, { type: 'slow' })
export class RenamePeopleDataLabsApiKeysSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await this.renameApplicationVariableKey({
      entityManager: dataSource.manager,
      fromKey: LEGACY_APP_KEY,
      toKey: RENAMED_APP_KEY,
    });
    await this.renameConfigVariableKey({
      entityManager: dataSource.manager,
      fromKey: LEGACY_ENGINE_KEY,
      toKey: RENAMED_ENGINE_KEY,
    });
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.renameApplicationVariableKey({
      entityManager: queryRunner.manager,
      fromKey: RENAMED_APP_KEY,
      toKey: LEGACY_APP_KEY,
    });
    await this.renameConfigVariableKey({
      entityManager: queryRunner.manager,
      fromKey: RENAMED_ENGINE_KEY,
      toKey: LEGACY_ENGINE_KEY,
    });
  }

  private async renameApplicationVariableKey({
    entityManager,
    fromKey,
    toKey,
  }: {
    entityManager: EntityManager;
    fromKey: string;
    toKey: string;
  }): Promise<void> {
    const registration = await entityManager
      .getRepository(ApplicationRegistrationEntity)
      .findOne({
        where: {
          universalIdentifier:
            PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
        select: { id: true },
      });

    if (!isDefined(registration)) {
      return;
    }

    const variableRepository = entityManager.getRepository(
      ApplicationRegistrationVariableEntity,
    );

    const variables = await variableRepository.find({
      where: {
        applicationRegistrationId: registration.id,
        key: In([fromKey, toKey]),
      },
    });

    const sourceVariable = variables.find(
      (variable) => variable.key === fromKey,
    );
    const targetVariable = variables.find((variable) => variable.key === toKey);

    if (!isDefined(sourceVariable) || targetVariable?.isFilled === true) {
      return;
    }

    if (isDefined(targetVariable)) {
      await variableRepository.delete(targetVariable.id);
    }

    await variableRepository.update(sourceVariable.id, { key: toKey });
  }

  private async renameConfigVariableKey({
    entityManager,
    fromKey,
    toKey,
  }: {
    entityManager: EntityManager;
    fromKey: string;
    toKey: string;
  }): Promise<void> {
    const keyValuePairRepository =
      entityManager.getRepository(KeyValuePairEntity);

    const instanceScope = {
      type: KeyValuePairType.CONFIG_VARIABLE,
      userId: IsNull(),
      workspaceId: IsNull(),
    };

    const sourcePair = await keyValuePairRepository.findOne({
      where: { ...instanceScope, key: fromKey },
    });

    if (!isDefined(sourcePair)) {
      return;
    }

    const conflictingPair = await keyValuePairRepository.findOne({
      where: { ...instanceScope, key: toKey },
    });

    if (isDefined(conflictingPair)) {
      return;
    }

    await keyValuePairRepository.update(sourcePair.id, { key: toKey });
  }
}
