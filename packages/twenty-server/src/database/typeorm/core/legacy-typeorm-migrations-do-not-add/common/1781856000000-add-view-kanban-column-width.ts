import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddViewKanbanColumnWidth1781856000000 implements MigrationInterface {
  name = 'AddViewKanbanColumnWidth1781856000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "kanbanColumnWidth" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "kanbanColumnWidth"`,
    );
  }
}
