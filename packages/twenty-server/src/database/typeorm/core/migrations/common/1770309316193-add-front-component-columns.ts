import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFrontComponentColumns1770309316193
  implements MigrationInterface
{
  name = 'AddFrontComponentColumns1770309316193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "sourceComponentPath" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "builtComponentPath" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "componentName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "checksum" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "checksum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "componentName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "builtComponentPath"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "sourceComponentPath"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "description"`,
    );
  }
}
