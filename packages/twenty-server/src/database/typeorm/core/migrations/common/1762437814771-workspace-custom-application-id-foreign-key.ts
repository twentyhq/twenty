import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class WorkspaceCustomApplicationIdForeignKey1762437814771
  implements MigrationInterface
{
  name = 'WorkspaceCustomApplicationIdForeignKey1762437814771';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
    );
  }
}
