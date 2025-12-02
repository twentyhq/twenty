import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ChangeAgentDescriptionToText1764672601466
  implements MigrationInterface
{
  name = 'ChangeAgentDescriptionToText1764672601466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "description" TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "description" TYPE character varying`,
    );
  }
}
