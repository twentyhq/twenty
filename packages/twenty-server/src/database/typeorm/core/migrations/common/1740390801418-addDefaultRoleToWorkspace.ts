import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultRoleToWorkspace1740390801418
  implements MigrationInterface
{
  name = 'AddDefaultRoleToWorkspace1740390801418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "defaultRoleId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "defaultRoleId"`,
    );
  }
}
