import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationDebt1726757368824 implements MigrationInterface {
  name = 'MigrationDebt1726757368824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."relationMetadata_ondeleteaction_enum" RENAME TO "relationMetadata_ondeleteaction_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."relationMetadata_ondeleteaction_enum" AS ENUM('CASCADE', 'RESTRICT', 'SET_NULL', 'NO_ACTION')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" ALTER COLUMN "onDeleteAction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" ALTER COLUMN "onDeleteAction" TYPE "core"."relationMetadata_ondeleteaction_enum" USING "onDeleteAction"::"text"::"core"."relationMetadata_ondeleteaction_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" ALTER COLUMN "onDeleteAction" SET DEFAULT 'SET_NULL'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."relationMetadata_ondeleteaction_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceMigration" ALTER COLUMN "name" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceMigration" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."relationMetadata_ondeleteaction_enum_old" AS ENUM('CASCADE', 'RESTRICT', 'SET_NULL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" ALTER COLUMN "onDeleteAction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" ALTER COLUMN "onDeleteAction" TYPE "core"."relationMetadata_ondeleteaction_enum_old" USING "onDeleteAction"::"text"::"core"."relationMetadata_ondeleteaction_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."relationMetadata" ALTER COLUMN "onDeleteAction" SET DEFAULT 'SET_NULL'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."relationMetadata_ondeleteaction_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."relationMetadata_ondeleteaction_enum_old" RENAME TO "relationMetadata_ondeleteaction_enum"`,
    );
  }
}
