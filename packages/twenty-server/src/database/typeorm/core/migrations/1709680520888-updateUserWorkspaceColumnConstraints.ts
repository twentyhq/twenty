import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUserWorkspaceColumnConstraints1709680520888
  implements MigrationInterface
{
  name = 'updateUserWorkspaceColumnConstraints1709680520888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ----------------- WARNING ------------------------
    // Dropping constraints and adding them back is NOT a recommended and should be AVOIDED,
    // since it can affect data integrity and cause downtime and unintentional data loss.
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "userWorkspace_userId_fkey"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "userWorkspace_workspaceId_fkey"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_cb488f32c6a0827b938edadf221"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_37fdc7357af701e595c5c3a9bd6"`,
    );

    await queryRunner.query(`
            DO $$
            DECLARE
                record RECORD;
            BEGIN
                FOR record IN SELECT * FROM "core"."userWorkspace"
                              WHERE "userId" NOT IN (SELECT "id" FROM "core"."user")
                              OR "workspaceId" NOT IN (SELECT "id" FROM "core"."workspace")
                LOOP
                    IF NOT EXISTS (SELECT 1 FROM "core"."user" WHERE "id" = record."userId") THEN
                        
                    END IF;

                    IF NOT EXISTS (SELECT 1 FROM "core"."workspace" WHERE "id" = record."workspace") THEN
                        
                    END IF;

                END LOOP;
            END;
            $$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."userWorkspace" 
            ADD CONSTRAINT "FK_37fdc7357af701e595c5c3a9bd6" 
            FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "core"."userWorkspace" 
            ADD CONSTRAINT "FK_cb488f32c6a0827b938edadf221" 
            FOREIGN KEY ("userId") REFERENCES "core"."user"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(): Promise<void> {}
}
