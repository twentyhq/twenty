import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Backing table for the npm publish-code ownership challenge: one pending
// claim per (registration, workspace), removed once ownership is settled.
@RegisteredInstanceCommand('2.20.0', 1783200000000)
export class CreateApplicationRegistrationClaimCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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
        CONSTRAINT "FK_applicationRegistrationClaim_registrationId" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_applicationRegistrationClaim_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_applicationRegistrationClaim_createdByUserId" FOREIGN KEY ("createdByUserId") REFERENCES "core"."user"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_APPLICATION_REGISTRATION_CLAIM_REGISTRATION_WORKSPACE_UNIQUE"
        ON "core"."applicationRegistrationClaim" ("applicationRegistrationId", "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."applicationRegistrationClaim"`,
    );
  }
}
