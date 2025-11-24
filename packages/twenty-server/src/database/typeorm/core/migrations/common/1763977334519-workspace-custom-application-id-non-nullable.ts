import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkspaceCustomApplicationIdNonNullable1763977334519
  implements MigrationInterface
{
  name = 'WorkspaceCustomApplicationIdNonNullable1763977334519';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."workspace" ALTER COLUMN "workspaceCustomApplicationId" SET NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
      );
    } catch (e) {
      console.error(
        'Swallowing WorkspaceCustomApplicationIdNonNullable1763977334519 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "workspaceCustomApplicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
