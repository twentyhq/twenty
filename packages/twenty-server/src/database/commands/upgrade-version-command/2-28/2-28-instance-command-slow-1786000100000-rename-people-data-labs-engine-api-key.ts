import { isDefined } from 'twenty-shared/utils';
import { DataSource, IsNull, QueryRunner, type EntityManager } from 'typeorm';

import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const LEGACY_ENGINE_KEY = 'PEOPLE_DATA_LABS_API_KEY';
const RENAMED_ENGINE_KEY = 'PEOPLE_DATA_LABS_ENGINE_API_KEY';

@RegisteredInstanceCommand('2.28.0', 1786000100000, { type: 'slow' })
export class RenamePeopleDataLabsEngineApiKeySlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await this.renameConfigVariableKey({
      entityManager: dataSource.manager,
      fromKey: LEGACY_ENGINE_KEY,
      toKey: RENAMED_ENGINE_KEY,
    });
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.renameConfigVariableKey({
      entityManager: queryRunner.manager,
      fromKey: RENAMED_ENGINE_KEY,
      toKey: LEGACY_ENGINE_KEY,
    });
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
      applicationId: IsNull(),
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
