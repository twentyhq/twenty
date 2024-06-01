import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export enum KeyValueTypes {
  USER_STATE = 'USER_STATE',
}

export enum UserStateKeys {
  EMAIL_SYNC_ONBOARDING_STEP = 'EMAIL_SYNC_ONBOARDING_STEP',
}

export enum EmailSyncOnboardingStepValues {
  SKIPPED = 'SKIPPED',
}

type KeyValuePairs = {
  [KeyValueTypes.USER_STATE]: {
    [UserStateKeys.EMAIL_SYNC_ONBOARDING_STEP]: EmailSyncOnboardingStepValues;
  };
};

export class KeyValuePairService<TYPE extends keyof KeyValuePairs> {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {}

  async get<K extends keyof KeyValuePairs[TYPE]>(
    userId: string,
    workspaceId: string,
    key: K,
  ) {
    return await this.keyValuePairRepository.findOne({
      where: {
        userId,
        workspaceId,
        key: key as string,
      },
    });
  }

  async set<K extends keyof KeyValuePairs[TYPE]>(
    userId: string,
    workspaceId: string,
    key: K,
    value: KeyValuePairs[TYPE][K],
  ) {
    await this.keyValuePairRepository.upsert(
      {
        userId,
        workspaceId,
        key: key as string,
        value: value as string,
      },
      { conflictPaths: ['userId', 'workspaceId', 'key'] },
    );
  }
}
