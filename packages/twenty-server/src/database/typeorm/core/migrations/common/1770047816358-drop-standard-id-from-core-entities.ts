import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class DropStandardIdFromCoreEntities1770047816358
  implements MigrationInterface
{
  name = 'DropStandardIdFromCoreEntities1770047816358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP COLUMN "standardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "standardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "standardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."skill" DROP COLUMN "standardId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."skill" ADD "standardId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "standardId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "core"."role" ADD "standardId" uuid`);
    await queryRunner.query(`ALTER TABLE "core"."agent" ADD "standardId" uuid`);
  }
}
