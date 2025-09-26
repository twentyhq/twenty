import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationColumns1758892922096 implements MigrationInterface {
  name = 'AddApplicationColumns1758892922096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "packageJson" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "yarnLock" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "packageChecksum" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "packageChecksum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "yarnLock"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "packageJson"`,
    );
  }
}
