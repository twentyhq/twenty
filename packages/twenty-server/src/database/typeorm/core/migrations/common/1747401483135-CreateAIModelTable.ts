import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAIModelTable1747401483135 implements MigrationInterface {
  name = 'CreateAIModelTable1747401483135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "core"."ModelProvider_enum" AS ENUM('openai', 'anthropic')
    `);

    await queryRunner.query(`
      CREATE TABLE "core"."aiModel" (
        "modelId" character varying NOT NULL,
        "deletedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "displayName" character varying NOT NULL,
        "provider" "core"."ModelProvider_enum" NOT NULL,
        "inputCostPer1kTokensInCents" decimal(10,4) NOT NULL,
        "outputCostPer1kTokensInCents" decimal(10,4) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "isDefault" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_aiModel_modelId" PRIMARY KEY ("modelId")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "core"."aiModel" (
        "modelId", "displayName", "provider", 
        "inputCostPer1kTokensInCents", "outputCostPer1kTokensInCents", "isDefault"
      ) VALUES
        ('gpt-4o', 'GPT-4o', 'openai', 0.25, 1.0, true),
        ('gpt-4o-mini', 'GPT-4o Mini', 'openai', 0.015, 0.06, false),
        ('gpt-4-turbo', 'GPT-4 Turbo', 'openai', 1.0, 3.0, false),
        ('claude-opus-4-20250514', 'Claude Opus 4', 'anthropic', 1.5, 7.5, false),
        ('claude-sonnet-4-20250514', 'Claude Sonnet 4', 'anthropic', 0.3, 1.5, false),
        ('claude-3-5-haiku-20241022', 'Claude Haiku 3.5', 'anthropic', 0.08, 0.4, false)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."aiModel"`);
    await queryRunner.query(`DROP TYPE "core"."ModelProvider_enum"`);
  }
}
