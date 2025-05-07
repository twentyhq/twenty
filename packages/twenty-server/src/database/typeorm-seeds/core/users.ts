import { DataSource } from 'typeorm';

const tableName = 'user';

export const DEV_SEED_USER_IDS = {
  TIM: '20202020-9e3b-46d4-a556-88b9ddc2b034',
  JONY: '20202020-3957-4908-9c36-2929a23f8357',
  PHIL: '20202020-7169-42cf-bc47-1cfef15264b8',
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
      'canImpersonate',
      'canAccessFullAdminPanel',
      'isEmailVerified',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_USER_IDS.TIM,
        firstName: 'Tim',
        lastName: 'Apple',
        email: 'tim@apple.dev',
        passwordHash:
          '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6', // tim@apple.dev
        canImpersonate: true,
        canAccessFullAdminPanel: true,
        isEmailVerified: true,
      },
      {
        id: DEV_SEED_USER_IDS.JONY,
        firstName: 'Jony',
        lastName: 'Ive',
        email: 'jony.ive@apple.dev',
        passwordHash:
          '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6', // tim@apple.dev
        canImpersonate: true,
        canAccessFullAdminPanel: true,
        isEmailVerified: true,
      },
      {
        id: DEV_SEED_USER_IDS.PHIL,
        firstName: 'Phil',
        lastName: 'Schiler',
        email: 'phil.schiler@apple.dev',
        passwordHash:
          '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6', // tim@apple.dev
        canImpersonate: true,
        canAccessFullAdminPanel: true,
        isEmailVerified: true,
      },
    ])
    .execute();
};
