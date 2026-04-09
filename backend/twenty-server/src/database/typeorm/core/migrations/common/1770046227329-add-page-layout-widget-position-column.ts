import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddPageLayoutWidgetPositionColumn1770046227329
  implements MigrationInterface
{
  name = 'AddPageLayoutWidgetPositionColumn1770046227329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "position" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "position"`,
    );
  }
}
