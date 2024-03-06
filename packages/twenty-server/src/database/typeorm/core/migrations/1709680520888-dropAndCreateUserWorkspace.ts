import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAndCreateUserWorkspace1709680520888
  implements MigrationInterface
{
  name = 'DropAndCreateUserWorkspace1709680520888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "core"."userWorkspace";
        `);

    await queryRunner.query(
      `CREATE TABLE "core"."userWorkspace" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
                "userId" uuid NOT NULL, 
                "workspaceId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP
            )`,
    );

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
