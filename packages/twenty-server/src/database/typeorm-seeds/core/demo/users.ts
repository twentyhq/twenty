import { DataSource } from 'typeorm';

// import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const tableName = 'user';

export const DEMO_SEED_USER_IDS = {
  NOAH: '20202020-9e3b-46d4-a556-88b9ddc2b035',
  HUGO: '20202020-3957-4908-9c36-2929a23f8358',
  TIM: '20202020-9e3b-46d4-a556-88b9ddc2b034',
};

export const seedUsers = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'firstName',
      'lastName',
      'email',
      'passwordHash',
      'isEmailVerified',
    ])
    .orIgnore()
    .values([
      {
        id: DEMO_SEED_USER_IDS.NOAH,
        firstName: 'Noah',
        lastName: 'A',
        email: 'noah@demo.dev',
        passwordHash:
          '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6', // tim@apple.dev
        isEmailVerified: true,
      },
      {
        id: DEMO_SEED_USER_IDS.HUGO,
        firstName: 'Hugo',
        lastName: 'I',
        email: 'hugo@demo.dev',
        passwordHash:
          '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6', // tim@apple.dev
        isEmailVerified: true,
      },
      {
        id: DEMO_SEED_USER_IDS.TIM,
        firstName: 'Tim',
        lastName: 'Apple',
        email: 'tim@apple.dev',
        passwordHash:
          '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6', // tim@apple.dev
        isEmailVerified: true,
      },
    ])
    .execute();
};

export const deleteUsersByWorkspace = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  const user = await dataSource
    .createQueryBuilder(`${schemaName}.${tableName}`, 'user')
    .leftJoinAndSelect('user.workspaces', 'userWorkspace')
    .where(`userWorkspace."workspaceId" = :workspaceId`, {
      workspaceId,
    })
    .getMany();

  await dataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."id" IN (:...ids)`, { ids: user.map((u) => u.id) })
    .execute();
};
