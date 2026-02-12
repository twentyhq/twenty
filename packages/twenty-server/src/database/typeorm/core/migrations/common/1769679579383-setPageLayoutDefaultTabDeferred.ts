import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class SetPageLayoutDefaultTabDeferred1769679579383
  implements MigrationInterface
{
  name = 'SetPageLayoutDefaultTabDeferred1769679579383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ALTER CONSTRAINT "FK_747fbc25827bdcb9e35cc68a990" DEFERRABLE INITIALLY DEFERRED`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ALTER CONSTRAINT "FK_747fbc25827bdcb9e35cc68a990" NOT DEFERRABLE INITIALLY DEFERRED`,
    );
  }
}
