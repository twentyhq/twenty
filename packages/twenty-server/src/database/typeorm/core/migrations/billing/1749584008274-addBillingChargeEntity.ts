import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingChargeEntity1749584008274 implements MigrationInterface {
  name = 'AddBillingChargeEntity1749584008274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."billingCharge_status_enum" AS ENUM('UNPAID', 'PAID', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingCharge" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chargeCode" character varying, "interBillingChargeFilePath" character varying, "status" "core"."billingCharge_status_enum" NOT NULL DEFAULT 'UNPAID', "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "billingSubscriptionId" uuid, CONSTRAINT "UQ_af8b841b92d14e255d6d326010b" UNIQUE ("chargeCode"), CONSTRAINT "PK_45779b305039f0cfe618ffd6121" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "currentInterBankSlipChargeFilePath" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "name" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingCustomer_legalentity_enum" AS ENUM('FISICA', 'JURIDICA')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "legalEntity" "core"."billingCustomer_legalentity_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "document" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "cep" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingCustomer_stateunity_enum" AS ENUM('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "stateUnity" "core"."billingCustomer_stateunity_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD "city" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" ADD CONSTRAINT "FK_cf324476a838a4b462ff56a55a8" FOREIGN KEY ("billingSubscriptionId") REFERENCES "core"."billingSubscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingCharge" DROP CONSTRAINT "FK_cf324476a838a4b462ff56a55a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "city"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "stateUnity"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingCustomer_stateunity_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "cep"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "document"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "legalEntity"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingCustomer_legalentity_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP COLUMN "currentInterBankSlipChargeFilePath"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingCharge"`);
    await queryRunner.query(`DROP TYPE "core"."billingCharge_status_enum"`);
  }
}
