import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDependencyChecksumsToLogicFunctionLayer1769804274285
  implements MigrationInterface
{
  name = 'AddDependencyChecksumsToLogicFunctionLayer1769804274285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" ADD "packageJsonChecksum" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" ADD "yarnLockChecksum" text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" DROP COLUMN "yarnLockChecksum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" DROP COLUMN "packageJsonChecksum"`,
    );
  }
}
