import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAvailableTables1716310822694 implements MigrationInterface {
  name = 'RemoveAvailableTables1716310822694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."remoteServer" DROP COLUMN "availableTables"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."remoteServer" ADD "availableTables" jsonb`,
    );
  }
}
