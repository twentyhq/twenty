import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllowImpersonationToWorkspace1700654387203
  implements MigrationInterface
{
  name = 'AddAllowImpersonationToWorkspace1700654387203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_5d77e050eabd28d203b301235a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "allowImpersonation" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" ADD CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" DROP CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "allowImpersonation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_5d77e050eabd28d203b301235a7" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
