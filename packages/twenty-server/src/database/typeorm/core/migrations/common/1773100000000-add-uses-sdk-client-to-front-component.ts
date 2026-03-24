import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUsesSdkClientToFrontComponent1773100000000
  implements MigrationInterface
{
  name = 'AddUsesSdkClientToFrontComponent1773100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "usesSdkClient" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "usesSdkClient"`,
    );
  }
}
