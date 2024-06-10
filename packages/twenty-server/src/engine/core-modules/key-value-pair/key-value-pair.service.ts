import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { Repository } from 'typeorm';

import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValueTypes } from 'src/engine/core-modules/key-value-pair/enums/key-value-types.enum';
import { OnboardingStepKeys } from 'src/engine/core-modules/key-value-pair/enums/keys/onboarding-step-keys.enum';
import { OnboardingStateValues } from 'src/engine/core-modules/key-value-pair/enums/values/onboarding-step-values.enum';

type KeyValuePairs = {
  [KeyValueTypes.ONBOARDING]: {
    [OnboardingStepKeys.SYNC_EMAIL_ONBOARDING_STEP]: OnboardingStateValues;
    [OnboardingStepKeys.INVITE_TEAM_ONBOARDING_STEP]: OnboardingStateValues;
  };
};

type KeyValueType<
  TYPE extends keyof KeyValuePairs,
  K extends keyof KeyValuePairs[TYPE],
> = KeyValuePairs[TYPE][K];
export class KeyValuePairService<TYPE extends keyof KeyValuePairs> {
  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {}

  async get<K extends keyof KeyValuePairs[TYPE]>({
    userId,
    workspaceId,
    key,
  }: {
    userId?: string;
    workspaceId?: string;
    key: K;
  }): Promise<KeyValueType<TYPE, K> | undefined> {
    return (
      await this.keyValuePairRepository.findOne({
        where: {
          userId,
          workspaceId,
          key: key as string,
        },
      })
    )?.value as KeyValueType<TYPE, K> | undefined;
  }

  async set<K extends keyof KeyValuePairs[TYPE]>({
    userId,
    workspaceId,
    key,
    value,
  }: {
    userId?: string;
    workspaceId?: string;
    key: K;
    value: KeyValuePairs[TYPE][K];
  }) {
    if (!userId && !workspaceId) {
      throw new BadRequestException('userId and workspaceId are undefined');
    }
    const upsertData = {
      userId,
      workspaceId,
      key: key as string,
      value: value as string,
    };

    const conflictPaths = Object.keys(upsertData).filter(
      (key) => key !== 'value' && upsertData[key] !== undefined,
    );

    const indexPredicate = !userId
      ? '"userId" is NULL'
      : !workspaceId
        ? '"workspaceId" is NULL'
        : undefined;

    await this.keyValuePairRepository.upsert(upsertData, {
      conflictPaths,
      indexPredicate,
    });
  }
}
