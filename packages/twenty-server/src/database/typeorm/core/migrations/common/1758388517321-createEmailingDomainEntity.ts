import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateEmailingDomainEntity1758388517321
  implements MigrationInterface
{
  name = 'CreateEmailingDomainEntity1758388517321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."emailingDomain_driver_enum" AS ENUM('AWS_SES')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."emailingDomain_status_enum" AS ENUM('PENDING', 'VERIFIED', 'FAILED', 'TEMPORARY_FAILURE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."emailingDomain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" character varying NOT NULL, "driver" "core"."emailingDomain_driver_enum" NOT NULL, "status" "core"."emailingDomain_status_enum" NOT NULL DEFAULT 'PENDING', "verificationRecords" jsonb, "verifiedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, CONSTRAINT "IDX_EMAILING_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE" UNIQUE ("domain", "workspaceId"), CONSTRAINT "PK_dca7032537b5d307f8cc6d74f1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" ADD CONSTRAINT "FK_793a938bef2aae0a2129f78951f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."emailingDomain" DROP CONSTRAINT "FK_793a938bef2aae0a2129f78951f"`,
    );
    await queryRunner.query(`DROP TABLE "core"."emailingDomain"`);
    await queryRunner.query(`DROP TYPE "core"."emailingDomain_status_enum"`);
    await queryRunner.query(`DROP TYPE "core"."emailingDomain_driver_enum"`);
  }
}
