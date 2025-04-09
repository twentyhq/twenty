import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessToFullAdminAndWorkspaceVersion1740415309924
  implements MigrationInterface
{
  name = 'AddAccessToFullAdminAndWorkspaceVersion1740415309924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "canAccessFullAdminPanel" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "version" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "version"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "canAccessFullAdminPanel"`,
    );
  }
}
