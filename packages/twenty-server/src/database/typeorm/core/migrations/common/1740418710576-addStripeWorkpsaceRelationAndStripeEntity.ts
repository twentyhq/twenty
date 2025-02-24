import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeWorkpsaceRelationAndStripeEntity1740418710576 implements MigrationInterface {
    name = 'AddStripeWorkpsaceRelationAndStripeEntity1740418710576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core"."stripeIntegration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" text, "workspaceId" uuid, CONSTRAINT "PK_eed23ecbf9710e70b1747570baf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."stripeIntegration" ADD CONSTRAINT "FK_8e5dfd91ccd5651b12bb2028cf4" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."stripeIntegration" DROP CONSTRAINT "FK_8e5dfd91ccd5651b12bb2028cf4"`);
        await queryRunner.query(`DROP TABLE "core"."stripeIntegration"`);
    }

}
