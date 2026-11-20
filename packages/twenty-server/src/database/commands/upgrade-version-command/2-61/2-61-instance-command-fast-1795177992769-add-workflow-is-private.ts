import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795177992769)
export class AddWorkflowIsPrivateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ADD "isPrivate" boolean',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "isPrivate" TYPE boolean USING ("visibility" = \'PRIVATE\')',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "isPrivate" SET DEFAULT false, ALTER COLUMN "isPrivate" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "visibility" DROP DEFAULT',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_WORKFLOW_IS_PRIVATE_CREATED_BY" ON "core"."workflow" ("workspaceId", "isPrivate", "createdByUserWorkspaceId") ',
    );
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "core"."syncWorkflowIsPrivateAndVisibility"()
      RETURNS trigger LANGUAGE plpgsql AS $function$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          IF NEW."visibility" IS NOT NULL THEN
            NEW."isPrivate" := NEW."visibility" = 'PRIVATE';
          ELSE
            NEW."visibility" := CASE WHEN NEW."isPrivate" THEN 'PRIVATE' ELSE 'WORKSPACE' END;
          END IF;
        ELSIF NEW."isPrivate" IS DISTINCT FROM OLD."isPrivate" THEN
          NEW."visibility" := CASE WHEN NEW."isPrivate" THEN 'PRIVATE' ELSE 'WORKSPACE' END;
        ELSIF NEW."visibility" IS DISTINCT FROM OLD."visibility" THEN
          NEW."isPrivate" := NEW."visibility" = 'PRIVATE';
        END IF;
        RETURN NEW;
      END;
      $function$;
    `);
    await queryRunner.query(
      `CREATE TRIGGER "syncWorkflowIsPrivateAndVisibility"
       BEFORE INSERT OR UPDATE ON "core"."workflow"
       FOR EACH ROW EXECUTE FUNCTION "core"."syncWorkflowIsPrivateAndVisibility"()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER "syncWorkflowIsPrivateAndVisibility" ON "core"."workflow"',
    );
    await queryRunner.query(
      'DROP FUNCTION "core"."syncWorkflowIsPrivateAndVisibility"()',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_WORKFLOW_IS_PRIVATE_CREATED_BY"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" ALTER COLUMN "visibility" SET DEFAULT \'WORKSPACE\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workflow" DROP COLUMN "isPrivate"',
    );
  }
}
