import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveUselessDeletedAt1756476065711 implements MigrationInterface {
  name = 'RemoveUselessDeletedAt1756476065711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP COLUMN "deletedAt"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }
}
