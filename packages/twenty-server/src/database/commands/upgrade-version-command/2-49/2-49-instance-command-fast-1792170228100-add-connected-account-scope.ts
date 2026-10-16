import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.49.0', 1792170228100)
export class AddConnectedAccountScopeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ADD "scope" character varying',
    );
    // Servers read scope once this completes; same-type USING fills it without an UPDATE
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ALTER COLUMN "scope" TYPE character varying USING upper("visibility")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ALTER COLUMN "scope" SET DEFAULT \'USER\', ALTER COLUMN "scope" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ALTER COLUMN "visibility" DROP DEFAULT',
    );
    // Only previous-release servers write visibility, so the trigger trusts it when set
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "core"."syncConnectedAccountScopeAndVisibility"()
      RETURNS trigger LANGUAGE plpgsql AS $function$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          IF NEW."visibility" IS NOT NULL THEN
            NEW."scope" := upper(NEW."visibility");
          ELSE
            NEW."visibility" := lower(NEW."scope");
          END IF;
        ELSIF NEW."scope" IS DISTINCT FROM OLD."scope" THEN
          NEW."visibility" := lower(NEW."scope");
        ELSIF NEW."visibility" IS DISTINCT FROM OLD."visibility" THEN
          NEW."scope" := upper(NEW."visibility");
        END IF;
        RETURN NEW;
      END;
      $function$;
    `);
    await queryRunner.query(
      `CREATE TRIGGER "syncConnectedAccountScopeAndVisibility"
       BEFORE INSERT OR UPDATE ON "core"."connectedAccount"
       FOR EACH ROW EXECUTE FUNCTION "core"."syncConnectedAccountScopeAndVisibility"()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER "syncConnectedAccountScopeAndVisibility" ON "core"."connectedAccount"',
    );
    await queryRunner.query(
      'DROP FUNCTION "core"."syncConnectedAccountScopeAndVisibility"()',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ALTER COLUMN "visibility" SET DEFAULT \'user\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" DROP COLUMN "scope"',
    );
  }
}
