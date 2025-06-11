import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIconToRole1741859116265 implements MigrationInterface {
  name = 'AddIconToRole1741859116265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "icon" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."role" DROP COLUMN "icon"`);
  }
}
