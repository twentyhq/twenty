import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRouterModelToWorkspace1760985484643
  implements MigrationInterface
{
  name = 'AddRouterModelToWorkspace1760985484643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "routerModel" character varying NOT NULL DEFAULT 'auto'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "routerModel"`,
    );
  }
}
