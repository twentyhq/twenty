import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UserInUserWorkspace1763112982879 implements MigrationInterface {
  name = 'UserInUserWorkspace1763112982879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "firstName" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "lastName" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "email" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "disabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "passwordHash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "canImpersonate" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "canAccessFullAdminPanel" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "canAccessFullAdminPanel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "canImpersonate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "passwordHash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "disabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "isEmailVerified"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "lastName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "firstName"`,
    );
  }
}
