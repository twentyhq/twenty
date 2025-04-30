import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingPlansWorkspaceRelationAndBillingPlansEntity1745406242764
  implements MigrationInterface
{
  name = 'AddBillingPlansWorkspaceRelationAndBillingPlansEntity1745406242764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."billingPlans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "planId" text, "workspaceId" uuid, CONSTRAINT "PK_bed23ecbf6520a71c1777570bcf" PRIMARY KEY ("id"))`,
    );
    // await queryRunner.query(
    //   `CREATE TABLE "core"."billingPlans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "planId" text, CONSTRAINT "PK_billingPlans_id" PRIMARY KEY ("id")
    //   )`,
    // );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPlans" ADD CONSTRAINT "FK_5a5bcc11dcd2041a16bbc1028cf4" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingPlans" DROP CONSTRAINT "FK_5a5bcc11dcd2041a16bbc1028cf4"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingPlans"`);
  }
}
