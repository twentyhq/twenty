import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.27.0', 1785681272278)
export class CreateApplicationAuthorizationCoreTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."applicationAuthorization" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "workspaceId" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "userWorkspaceId" uuid NOT NULL,
        "scopes" text array NOT NULL DEFAULT '{}',
        "lastAuthorizedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "lastUsedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_applicationAuthorization_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_APPLICATION_AUTHORIZATION_USER_ID" FOREIGN KEY ("userId")
          REFERENCES "core"."user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_APPLICATION_AUTHORIZATION_WORKSPACE_ID" FOREIGN KEY ("workspaceId")
          REFERENCES "core"."workspace"("id") ON DELETE CASCADE,
        -- Uninstalling deletes the application row, which already invalidates
        -- every token issued for it. Cascading here stops the grants outliving
        -- the install they describe.
        CONSTRAINT "FK_APPLICATION_AUTHORIZATION_APPLICATION_ID" FOREIGN KEY ("applicationId")
          REFERENCES "core"."application"("id") ON DELETE CASCADE,
        -- Losing the membership ends the authorization: the token carries this
        -- id and fails validation without it, so the row would otherwise linger
        -- unusable.
        CONSTRAINT "FK_APPLICATION_AUTHORIZATION_USER_WORKSPACE_ID" FOREIGN KEY ("userWorkspaceId")
          REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE
      )`,
    );

    // The table is created empty in this same transaction, so there is
    // nothing to lock or scan.
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_APPLICATION_AUTHORIZATION_USER_APPLICATION_UNIQUE" ON "core"."applicationAuthorization" ("userId", "applicationId")`,
    );
    // "userId" gets none of its own: it leads the unique index above, which
    // covers both the per-user listing and the cascade delete.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APPLICATION_AUTHORIZATION_WORKSPACE_ID" ON "core"."applicationAuthorization" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APPLICATION_AUTHORIZATION_APPLICATION_ID" ON "core"."applicationAuthorization" ("applicationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_APPLICATION_AUTHORIZATION_USER_WORKSPACE_ID" ON "core"."applicationAuthorization" ("userWorkspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."applicationAuthorization"`,
    );
  }
}
