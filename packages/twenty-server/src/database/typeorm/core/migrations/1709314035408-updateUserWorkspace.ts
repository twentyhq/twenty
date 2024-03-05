import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserWorkspace1709314035408 implements MigrationInterface {
  name = 'UpdateUserWorkspace1709314035408';
  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_cb488f32c6a0827b938edadf221"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_37fdc7357af701e595c5c3a9bd6"`,
    );
  }
}
