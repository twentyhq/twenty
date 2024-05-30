import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairCreated } from 'src/engine/core-modules/key-value-pair/dtos/key-value-pair-created.entity';

export enum EmailSyncStatus {
  SKIPPED = 'SKIPPED',
}

export enum KeyValuePairsKeys {
  EMAIL_SYNC_ONBOARDING_STEP = 'EMAIL_SYNC_ONBOARDING_STEP',
}

interface KeyValuePairsValues {
  [KeyValuePairsKeys.EMAIL_SYNC_ONBOARDING_STEP]: EmailSyncStatus;
}

type KeyValuePairType<KEY extends KeyValuePairsKeys> = {
  key: KEY;
  value: KeyValuePairsValues[KEY];
};

export class KeyValuePairService extends TypeOrmQueryService<KeyValuePair> {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {
    super(keyValuePairRepository);
  }

  async set<KEY extends KeyValuePairsKeys>(
    userId: string,
    workspaceId: string,
    keyValuePair: KeyValuePairType<KEY>,
  ): Promise<KeyValuePairCreated> {
    await this.keyValuePairRepository.upsert(
      {
        userId,
        workspaceId,
        key: keyValuePair.key,
        value: keyValuePair.value,
      },
      { conflictPaths: ['userId', 'workspaceId', 'key'] },
    );

    return { success: true };
  }

  async getMany(userId: string, workspaceId: string) {
    return await this.keyValuePairRepository.find({
      where: {
        userId,
        workspaceId,
      },
    });
  }

  async get(
    userId: string,
    workspaceId: string,
    keyValueKey?: KeyValuePairsKeys,
  ) {
    return await this.keyValuePairRepository.findOne({
      where: {
        userId,
        workspaceId,
        key: keyValueKey,
      },
    });
  }
}
