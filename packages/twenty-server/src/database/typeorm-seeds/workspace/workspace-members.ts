import { EntityManager } from 'typeorm';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_ACME_WORKSPACE_ID,
} from 'src/database/typeorm-seeds/core/workspaces';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { DEV_SEED_USER_IDS } from 'src/database/typeorm-seeds/core/users';

const tableName = 'workspaceMember';

export const DEV_SEED_WORKSPACE_MEMBER_IDS = {
  TIM: '20202020-0687-4c41-b707-ed1bfca972a7',
  JONY: '20202020-77d5-4cb6-b60a-f4a835a85d61',
  PHIL: '20202020-1553-45c6-a028-5a9064cce07f',
};

type WorkspaceMembers = Pick<
  WorkspaceMember,
  'id' | 'locale' | 'colorScheme'
> & {
  nameFirstName: string;
  nameLastName: string;
  userEmail: string;
  userId: string;
};

export const seedWorkspaceMember = async (
  entityManager: EntityManager,
  schemaName: string,
  workspaceId: string,
) => {
  let workspaceMembers: WorkspaceMembers[] = [];

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    workspaceMembers = [
      {
        id: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        nameFirstName: 'Tim',
        nameLastName: 'Apple',
        locale: 'en',
        colorScheme: 'Light',
        userEmail: 'tim@apple.dev',
        userId: DEV_SEED_USER_IDS.TIM,
      },
      {
        id: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
        nameFirstName: 'Jony',
        nameLastName: 'Ive',
        locale: 'en',
        colorScheme: 'Light',
        userEmail: 'jony.ive@apple.dev',
        userId: DEV_SEED_USER_IDS.JONY,
      },
      {
        id: DEV_SEED_WORKSPACE_MEMBER_IDS.PHIL,
        nameFirstName: 'Phil',
        nameLastName: 'Schiler',
        locale: 'en',
        colorScheme: 'Light',
        userEmail: 'phil.schiler@apple.dev',
        userId: DEV_SEED_USER_IDS.PHIL,
      },
    ];
  }

  if (workspaceId === SEED_ACME_WORKSPACE_ID) {
    workspaceMembers = [
      {
        id: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        nameFirstName: 'Tim',
        nameLastName: 'Apple',
        locale: 'en',
        colorScheme: 'Light',
        userEmail: 'tim@apple.dev',
        userId: DEV_SEED_USER_IDS.TIM,
      },
    ];
  }
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'nameFirstName',
      'nameLastName',
      'locale',
      'colorScheme',
      'userEmail',
      'userId',
    ])
    .orIgnore()
    .values(workspaceMembers)
    .execute();
};
