import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddDependencyChecksumsToLogicFunctionLayer1770038963629
  implements MigrationInterface
{
  name = 'AddDependencyChecksumsToLogicFunctionLayer1770038963629';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" ADD "packageJsonChecksum" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" ALTER COLUMN "checksum" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" RENAME COLUMN "checksum" TO "yarnLockChecksum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" RENAME COLUMN "yarnLockChecksum" TO "checksum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" ALTER COLUMN "checksum" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" DROP COLUMN "packageJsonChecksum"`,
    );
  }
}
