import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSuprotForInterIntegration1748985243278 implements MigrationInterface {
    name = 'AddedSuprotForInterIntegration1748985243278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."billingPlans" DROP CONSTRAINT "FK_5a5bcc11dcd2041a16bbc1028cf4"`);
        await queryRunner.query(`ALTER TABLE "core"."billingPlans" ADD "planPrice" numeric`);
        await queryRunner.query(`ALTER TABLE "core"."billingCustomer" ADD "interBillingChargeId" character varying`);
        await queryRunner.query(`ALTER TABLE "core"."billingCustomer" ADD CONSTRAINT "UQ_9a4355ed47629987cd9d1cd6854" UNIQUE ("interBillingChargeId")`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" ADD "interBillingChargeId" character varying`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "UQ_2710d5b614d5804f9b7f443c88f" UNIQUE ("interBillingChargeId")`);
        await queryRunner.query(`ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356"`);
        await queryRunner.query(`ALTER TABLE "core"."billingCustomer" ALTER COLUMN "stripeCustomerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" ALTER COLUMN "stripeCustomerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."billingPlans" ADD CONSTRAINT "FK_fde9b7e3bf07a38a7ee08afe0f9" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "FK_e576e45ea2b21aef8271826622e" FOREIGN KEY ("stripeProductId") REFERENCES "core"."billingProduct"("stripeProductId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "FK_e576e45ea2b21aef8271826622e"`);
        await queryRunner.query(`ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356"`);
        await queryRunner.query(`ALTER TABLE "core"."billingPlans" DROP CONSTRAINT "FK_fde9b7e3bf07a38a7ee08afe0f9"`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" ALTER COLUMN "stripeSubscriptionId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" ALTER COLUMN "stripeCustomerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."billingCustomer" ALTER COLUMN "stripeCustomerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "UQ_2710d5b614d5804f9b7f443c88f"`);
        await queryRunner.query(`ALTER TABLE "core"."billingSubscription" DROP COLUMN "interBillingChargeId"`);
        await queryRunner.query(`ALTER TABLE "core"."billingCustomer" DROP CONSTRAINT "UQ_9a4355ed47629987cd9d1cd6854"`);
        await queryRunner.query(`ALTER TABLE "core"."billingCustomer" DROP COLUMN "interBillingChargeId"`);
        await queryRunner.query(`ALTER TABLE "core"."billingPlans" DROP COLUMN "planPrice"`);
        await queryRunner.query(`ALTER TABLE "core"."billingPlans" ADD CONSTRAINT "FK_5a5bcc11dcd2041a16bbc1028cf4" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
