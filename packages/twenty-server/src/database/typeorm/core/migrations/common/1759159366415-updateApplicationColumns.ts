import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateApplicationColumns1759159366415
  implements MigrationInterface
{
  name = 'UpdateApplicationColumns1759159366415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "packageJson" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "yarnLock" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "packageChecksum" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "packageChecksum" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "yarnLock" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "packageJson" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }
}
