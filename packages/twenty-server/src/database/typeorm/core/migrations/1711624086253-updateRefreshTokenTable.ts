import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRefreshTokenTable1711624086253
  implements MigrationInterface
{
  name = 'UpdateRefreshTokenTable1711624086253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" RENAME TO "appToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD "workspaceId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD "type" text NOT NULL DEFAULT 'REFRESH_TOKEN'`,
    );
    await queryRunner.query(`ALTER TABLE "core"."appToken" ADD "value" text`);
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_8cd4819144baf069777b5729136" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_8cd4819144baf069777b5729136"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP COLUMN "value"`,
    );
    await queryRunner.query(`ALTER TABLE "core"."appToken" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP COLUMN "workspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" RENAME TO "refreshToken"`,
    );
  }
}
