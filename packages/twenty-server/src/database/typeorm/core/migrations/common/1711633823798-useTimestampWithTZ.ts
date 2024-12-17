import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseTimestampWithTZ1711633823798 implements MigrationInterface {
  name = 'UseTimestampWithTZ1711633823798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC'`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "passwordResetTokenExpiresAt" TYPE TIMESTAMP WITH TIME ZONE USING "passwordResetTokenExpiresAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt" AT TIME ZONE 'UTC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ALTER COLUMN "updatedAt" TYPE TIMESTAMP`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "deletedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "deletedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "passwordResetTokenExpiresAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "updatedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "deletedAt" TYPE TIMESTAMP`,
    );
  }
}
