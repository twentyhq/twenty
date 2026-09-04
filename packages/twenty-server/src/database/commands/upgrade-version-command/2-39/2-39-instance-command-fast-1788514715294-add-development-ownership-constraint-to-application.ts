import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const DEVELOPMENT_WORKSPACE_ID_EXPRESSION = `CASE WHEN "sourceType" = 'local' AND "deletedAt" IS NULL THEN "workspaceId" END`;

const FOREIGN_KEY_NAME =
  'FK_APPLICATION_DEVELOPMENT_WORKSPACE_OWNS_REGISTRATION';

const UNIQUE_CONSTRAINT_NAME =
  'IDX_APPLICATION_REGISTRATION_ID_WORKSPACE_ID_UNIQUE';

// A live development (local) app must point at a registration its own
// workspace owns. The generated column mirrors workspaceId for such apps only,
// so the composite foreign key skips installed apps (null column).
@RegisteredInstanceCommand('2.39.0', 1788514715294)
export class AddDevelopmentOwnershipConstraintToApplicationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "developmentWorkspaceId" uuid GENERATED ALWAYS AS (${DEVELOPMENT_WORKSPACE_ID_EXPRESSION}) STORED`,
    );
    // TypeORM compares generated column expressions against this table, keyed
    // by the current database name. A single metadata row, not a backfill, so
    // the lock concern behind the rule does not apply.
    /* oxlint-disable twenty/no-data-mutation-in-fast-instance-command */
    await queryRunner.query(
      `INSERT INTO "core"."_typeorm_generated_columns_and_materialized_views"("database", "schema", "table", "type", "name", "value") VALUES (current_database(), 'core', 'application', 'GENERATED_COLUMN', 'developmentWorkspaceId', $1)`,
      [DEVELOPMENT_WORKSPACE_ID_EXPRESSION],
    );
    /* oxlint-enable twenty/no-data-mutation-in-fast-instance-command */
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "${UNIQUE_CONSTRAINT_NAME}" UNIQUE ("id", "workspaceId")`,
    );
    // NOT VALID: development apps synced before ownership was enforced may sit
    // on a registration their workspace does not own; they are left in place
    // and every new or updated row is checked.
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "${FOREIGN_KEY_NAME}" FOREIGN KEY ("applicationRegistrationId", "developmentWorkspaceId") REFERENCES "core"."applicationRegistration"("id", "workspaceId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT IF EXISTS "${FOREIGN_KEY_NAME}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT IF EXISTS "${UNIQUE_CONSTRAINT_NAME}"`,
    );
    await queryRunner.query(
      `DELETE FROM "core"."_typeorm_generated_columns_and_materialized_views" WHERE "type" = 'GENERATED_COLUMN' AND "name" = 'developmentWorkspaceId' AND "database" = current_database() AND "schema" = 'core' AND "table" = 'application'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN IF EXISTS "developmentWorkspaceId"`,
    );
  }
}
