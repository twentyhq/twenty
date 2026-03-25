import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddLogoFileIdColumnOnWorkspaceTable1771323022170
  implements MigrationInterface
{
  name = 'AddLogoFileIdColumnOnWorkspaceTable1771323022170';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "logoFileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_282123b2f32e927b6003311e33a" UNIQUE ("logoFileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_282123b2f32e927b6003311e33a" FOREIGN KEY ("logoFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_282123b2f32e927b6003311e33a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_282123b2f32e927b6003311e33a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "logoFileId"`,
    );
  }
}
