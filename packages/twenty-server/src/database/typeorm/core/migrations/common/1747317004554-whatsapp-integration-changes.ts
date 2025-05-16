import { MigrationInterface, QueryRunner } from "typeorm";

export class WhatsappIntegrationChanges1747317004554 implements MigrationInterface {
    name = 'WhatsappIntegrationChanges1747317004554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."inbox" DROP CONSTRAINT "FK_8c2ae450d5b70eaa1a1af61b1f2"`);
        await queryRunner.query(`CREATE TABLE "core"."chatbotFlow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nodes" jsonb, "edges" jsonb, "viewport" jsonb, "chatbotId" character varying NOT NULL, "workspaceId" uuid, CONSTRAINT "UQ_0089d03958ebd0e486947d18a23" UNIQUE ("chatbotId"), CONSTRAINT "PK_72a2f7d34ae2bbe2decf607a6d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" DROP COLUMN "whatsappIntegrationId"`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" ADD "whatsappIntegrationId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" DROP COLUMN "stripe_product_id"`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" ADD "stripe_product_id" character varying`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" DROP COLUMN "stripe_price_id"`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" ADD "stripe_price_id" character varying`);
        await queryRunner.query(`ALTER TABLE "core"."chatbotFlow" ADD CONSTRAINT "FK_9a0230be52d45791355e2f62bc6" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."chatbotFlow" DROP CONSTRAINT "FK_9a0230be52d45791355e2f62bc6"`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" DROP COLUMN "stripe_price_id"`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" ADD "stripe_price_id" text`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" DROP COLUMN "stripe_product_id"`);
        await queryRunner.query(`ALTER TABLE "core"."onboardingPlans" ADD "stripe_product_id" text`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" DROP COLUMN "whatsappIntegrationId"`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" ADD "whatsappIntegrationId" uuid`);
        await queryRunner.query(`DROP TABLE "core"."chatbotFlow"`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" ADD CONSTRAINT "FK_8c2ae450d5b70eaa1a1af61b1f2" FOREIGN KEY ("whatsappIntegrationId") REFERENCES "core"."whatsappIntegration"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
