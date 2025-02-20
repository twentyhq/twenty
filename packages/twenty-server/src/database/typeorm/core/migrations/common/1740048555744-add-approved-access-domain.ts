import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovedAccessDomain1740048555744
  implements MigrationInterface
{
  name = 'AddApprovedAccessDomain1740048555744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."approvedAccessDomain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" character varying NOT NULL, "isValidated" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, CONSTRAINT "IndexOnDomainAndWorkspaceId" UNIQUE ("domain", "workspaceId"), CONSTRAINT "PK_523281ce57c84e1a039f4538c19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" ADD CONSTRAINT "FK_73d3e340b6ce0716a25a86361fc" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" DROP CONSTRAINT "FK_73d3e340b6ce0716a25a86361fc"`,
    );
    await queryRunner.query(`DROP TABLE "core"."approvedAccessDomain"`);
  }
}
