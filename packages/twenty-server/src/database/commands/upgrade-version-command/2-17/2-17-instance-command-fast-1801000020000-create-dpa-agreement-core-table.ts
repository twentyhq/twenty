import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Creates the core."dpaAgreement" table backing DpaAgreementEntity.
//
// NOTE: this was authored by hand (no DB available at authoring time). Before
// release, verify against a database with
//   npx nx run twenty-server:database:migrate:generate --name create-dpa-agreement --type fast
// which should report no diff. The FK name below reproduces TypeORM's default
// hash for (dpaAgreement.workspaceId) so the entity and this table stay in sync.
@RegisteredInstanceCommand('2.17.0', 1801000020000)
export class CreateDpaAgreementCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."dpaAgreement_type_enum" AS ENUM ('CLICK_THROUGH', 'SIGNED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."dpaAgreement" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "core"."dpaAgreement_type_enum" NOT NULL,
        "templateVersion" character varying NOT NULL,
        "region" character varying NOT NULL,
        "processorEntity" character varying NOT NULL,
        "customerLegalEntityName" character varying,
        "signatoryName" character varying,
        "signatoryTitle" character varying,
        "signedFileId" uuid,
        "acceptedByUserId" uuid,
        "acceptedByEmail" character varying,
        "acceptedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "workspaceId" uuid NOT NULL,
        CONSTRAINT "PK_dpaAgreement_id" PRIMARY KEY ("id"),
        -- FK name must match TypeORM's generated hash for the workspace relation.
        CONSTRAINT "FK_abba2f6707bd2bc18bbd52f3c3e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_DPA_AGREEMENT_WORKSPACE_ID"
        ON "core"."dpaAgreement" ("workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."dpaAgreement"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."dpaAgreement_type_enum"`,
    );
  }
}
