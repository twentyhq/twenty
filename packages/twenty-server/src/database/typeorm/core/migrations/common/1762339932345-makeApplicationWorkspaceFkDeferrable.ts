import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class MakeApplicationWorkspaceFkDeferrable1762339932345
  implements MigrationInterface
{
  name = 'MakeApplicationWorkspaceFkDeferrable1762339932345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT IF EXISTS "FK_08d1d5e33c2a3ce7c140e9b335b"`,
    );

    // Recreate application.workspaceId FK as DEFERRABLE INITIALLY DEFERRED
    // This is the ONLY deferrable constraint - needed because we create application before workspace
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_08d1d5e33c2a3ce7c140e9b335b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT IF EXISTS "FK_08d1d5e33c2a3ce7c140e9b335b"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_08d1d5e33c2a3ce7c140e9b335b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
