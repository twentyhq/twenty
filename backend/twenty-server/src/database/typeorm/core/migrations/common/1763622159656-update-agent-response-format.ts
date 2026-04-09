import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateAgentResponseFormat1763622159656
  implements MigrationInterface
{
  name = 'UpdateAgentResponseFormat1763622159656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."agent" SET "responseFormat" = '{"type":"text"}' WHERE "responseFormat" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "responseFormat" SET DEFAULT '{"type":"text"}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "responseFormat" DROP DEFAULT`,
    );
  }
}
