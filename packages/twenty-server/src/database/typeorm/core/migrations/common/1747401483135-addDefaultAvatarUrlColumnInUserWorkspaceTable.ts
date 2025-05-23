import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultAvatarUrlColumnInUserWorkspaceTable1747401483135
  implements MigrationInterface
{
  name = 'AddDefaultAvatarUrlColumnInUserWorkspaceTable1747401483135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "defaultAvatarUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "defaultAvatarUrl"`,
    );
  }
}
