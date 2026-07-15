import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Claim challenges move from the dedicated applicationRegistrationClaim table
// to APPLICATION_REGISTRATION_CLAIM_TOKEN rows in appToken. Pending claims are
// ephemeral (72h expiry), so they are dropped rather than migrated.
@RegisteredInstanceCommand('2.22.0', 1784153821819)
export class ReplaceApplicationRegistrationClaimWithAppTokenFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" ADD "listingRequestContactEmail" text');
    await queryRunner.query('ALTER TABLE "core"."appToken" ADD "applicationRegistrationId" uuid');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_APP_TOKEN_APPLICATION_REGISTRATION_WORKSPACE_CLAIM_UNIQUE" ON "core"."appToken" ("applicationRegistrationId", "workspaceId") WHERE "type" = \'APPLICATION_REGISTRATION_CLAIM_TOKEN\'');
    await queryRunner.query('ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_b5dc965148b31b11e03167b6c97" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('DROP TABLE IF EXISTS "core"."applicationRegistrationClaim"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."applicationRegistrationClaim" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "applicationRegistrationId" uuid NOT NULL,
        "workspaceId" uuid NOT NULL,
        "createdByUserId" uuid,
        "token" text NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_applicationRegistrationClaim_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_7d1ea86fd78e1591a3bab283481" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_5f082b9be9c2c2b0a1365a86d9e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_7e4c6bf2f123cac7e5f414e6999" FOREIGN KEY ("createdByUserId") REFERENCES "core"."user"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_APP_REGISTRATION_CLAIM_REGISTRATION_WORKSPACE_UNIQUE"
        ON "core"."applicationRegistrationClaim" ("applicationRegistrationId", "workspaceId")`,
    );
    await queryRunner.query('ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_b5dc965148b31b11e03167b6c97"');
    await queryRunner.query('DROP INDEX "core"."IDX_APP_TOKEN_APPLICATION_REGISTRATION_WORKSPACE_CLAIM_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."appToken" DROP COLUMN "applicationRegistrationId"');
    await queryRunner.query('ALTER TABLE "core"."applicationRegistration" DROP COLUMN "listingRequestContactEmail"');
  }
}
