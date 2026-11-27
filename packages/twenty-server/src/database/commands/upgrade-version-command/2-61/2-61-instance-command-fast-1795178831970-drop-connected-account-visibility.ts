import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795178831970)
export class DropConnectedAccountVisibilityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER "syncConnectedAccountScopeAndVisibility" ON "core"."connectedAccount"',
    );
    await queryRunner.query(
      'DROP FUNCTION "core"."syncConnectedAccountScopeAndVisibility"()',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" DROP COLUMN "visibility"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ADD "visibility" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ALTER COLUMN "visibility" TYPE character varying USING lower("scope")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ALTER COLUMN "visibility" SET NOT NULL',
    );
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
}
