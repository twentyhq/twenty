import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnboardingPlans1747226519754 implements MigrationInterface {
  name = 'OnboardingPlans1747226519754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."onboardingPlans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "price" integer NOT NULL, "type" text NOT NULL, "features" text array NOT NULL, "stripe_product_id" text, "stripe_price_id" text, CONSTRAINT "UQ_6f0b46df0a4a842c5c43fe1c908" UNIQUE ("title"), CONSTRAINT "PK_ddf683f9fc505f9623079593c20" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."onboardingPlans"`);
  }
}
