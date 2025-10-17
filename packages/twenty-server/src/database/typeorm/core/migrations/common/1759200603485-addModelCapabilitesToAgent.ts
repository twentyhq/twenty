import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddNativeCapabilitesToAgent1759200603485
  implements MigrationInterface
{
  name = 'AddNativeCapabilitesToAgent1759200603485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD "modelConfiguration" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP COLUMN "modelConfiguration"`,
    );
  }
}
