import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIsHeadlessToFrontComponent1771509478665
  implements MigrationInterface
{
  name = 'AddIsHeadlessToFrontComponent1771509478665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "isHeadless" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "isHeadless"`,
    );
  }
}
