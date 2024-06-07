import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { Repository } from 'typeorm';

import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { UserStates } from 'src/engine/core-modules/user-state/enums/user-states.enum';
import { UserStateEmailSyncValues } from 'src/engine/core-modules/user-state/enums/values/user-state-email-sync-values.enum';
import { WorkspaceStates } from 'src/engine/core-modules/workspace-state/enums/workspace-states.enum';
import { WorkspaceStateInviteTeamValues } from 'src/engine/core-modules/workspace-state/enums/values/workspace-state-invite-team-values.enum';

export enum KeyValueTypes {
  USER_STATE = 'USER_STATE',
  WORKSPACE_STATE = 'WORKSPACE_STATE',
}

type KeyValuePairs = {
  [KeyValueTypes.USER_STATE]: {
    [UserStates.SYNC_EMAIL_ONBOARDING_STEP]: UserStateEmailSyncValues;
  };
  [KeyValueTypes.WORKSPACE_STATE]: {
    [WorkspaceStates.INVITE_TEAM_ONBOARDING_STEP]: WorkspaceStateInviteTeamValues;
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
  }): Promise<KeyValueType<TYPE, K>> {
    return (
      await this.keyValuePairRepository.findOne({
        where: {
          userId,
          workspaceId,
          key: key as string,
        },
      })
    )?.value as KeyValueType<TYPE, K>;
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
