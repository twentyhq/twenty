import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAgentTurnEvaluation1764200000000 implements MigrationInterface {
  name = 'AddAgentTurnEvaluation1764200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "core"."agentTurnEvaluation" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "turnId" uuid NOT NULL,
        "score" int NOT NULL,
        "comment" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agentTurnEvaluation" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_c94f072dbd3c11f7df51db5293"
      ON "core"."agentTurnEvaluation" ("turnId")
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."agentTurnEvaluation"
      ADD CONSTRAINT "FK_c94f072dbd3c11f7df51db52934"
      FOREIGN KEY ("turnId")
      REFERENCES "core"."agentTurn"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."agentTurnEvaluation"
      DROP CONSTRAINT "FK_c94f072dbd3c11f7df51db52934"
    `);
    await queryRunner.query(`
      DROP INDEX "core"."IDX_c94f072dbd3c11f7df51db5293"
    `);
    await queryRunner.query(`DROP TABLE "core"."agentTurnEvaluation"`);
  }
}
