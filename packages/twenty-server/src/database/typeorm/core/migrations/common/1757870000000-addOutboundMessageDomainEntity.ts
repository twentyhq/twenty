import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddOutboundMessageDomainEntity1757870000000
  implements MigrationInterface
{
  name = 'AddOutboundMessageDomainEntity1757870000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."outboundMessageDomain_driver_enum" AS ENUM('AWS_SES')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."outboundMessageDomain_status_enum" AS ENUM('PENDING', 'VERIFIED', 'FAILED', 'TEMPORARY_FAILURE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."outboundMessageDomain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" character varying NOT NULL, "driver" "core"."outboundMessageDomain_driver_enum" NOT NULL, "status" "core"."outboundMessageDomain_status_enum" NOT NULL DEFAULT 'PENDING', "verificationRecords" jsonb, "verifiedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, CONSTRAINT "IDX_OUTBOUND_MESSAGE_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE" UNIQUE ("domain", "workspaceId"), CONSTRAINT "PK_outboundMessageDomain" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."outboundMessageDomain" ADD CONSTRAINT "FK_outboundMessageDomain_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."outboundMessageDomain" DROP CONSTRAINT "FK_outboundMessageDomain_workspaceId"`,
    );
    await queryRunner.query(`DROP TABLE "core"."outboundMessageDomain"`);
    await queryRunner.query(
      `DROP TYPE "core"."outboundMessageDomain_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."outboundMessageDomain_driver_enum"`,
    );
  }
}
