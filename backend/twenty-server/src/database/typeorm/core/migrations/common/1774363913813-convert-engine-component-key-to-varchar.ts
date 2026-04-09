import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertEngineComponentKeyToVarchar1774363913813
  implements MigrationInterface
{
  name = 'ConvertEngineComponentKeyToVarchar1774363913813';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "CHK_CMD_MENU_ITEM_WF_OR_FC_OR_ENGINE_KEY"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" TYPE character varying USING "engineComponentKey"::text`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."commandMenuItem_enginecomponentkey_enum"`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' WHERE "workflowVersionId" IS NOT NULL AND "engineComponentKey" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "engineComponentKey" = 'FRONT_COMPONENT_RENDERER' WHERE "frontComponentId" IS NOT NULL AND "engineComponentKey" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE" CHECK (("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE"`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "engineComponentKey" = NULL WHERE "engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "engineComponentKey" = NULL WHERE "engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."commandMenuItem_enginecomponentkey_enum" AS ENUM('ACTIVATE_WORKFLOW', 'ADD_NODE_WORKFLOW', 'ADD_TO_FAVORITES', 'ASK_AI', 'CANCEL_DASHBOARD_LAYOUT', 'CREATE_NEW_RECORD', 'CREATE_NEW_VIEW', 'DEACTIVATE_WORKFLOW', 'DELETE_MULTIPLE_RECORDS', 'DELETE_SINGLE_RECORD', 'DESTROY_MULTIPLE_RECORDS', 'DESTROY_SINGLE_RECORD', 'DISCARD_DRAFT_WORKFLOW', 'DUPLICATE_DASHBOARD', 'DUPLICATE_WORKFLOW', 'EDIT_DASHBOARD_LAYOUT', 'EDIT_RECORD_PAGE_LAYOUT', 'EXPORT_FROM_RECORD_INDEX', 'EXPORT_FROM_RECORD_SHOW', 'EXPORT_MULTIPLE_RECORDS', 'EXPORT_NOTE_TO_PDF', 'EXPORT_VIEW', 'FRONT_COMPONENT_RENDERER', 'GO_TO_COMPANIES', 'GO_TO_DASHBOARDS', 'GO_TO_NOTES', 'GO_TO_OPPORTUNITIES', 'GO_TO_PEOPLE', 'GO_TO_RUNS', 'GO_TO_SETTINGS', 'GO_TO_TASKS', 'GO_TO_WORKFLOWS', 'HIDE_DELETED_RECORDS', 'IMPORT_RECORDS', 'MERGE_MULTIPLE_RECORDS', 'NAVIGATE_TO_NEXT_RECORD', 'NAVIGATE_TO_PREVIOUS_RECORD', 'REMOVE_FROM_FAVORITES', 'RESTORE_MULTIPLE_RECORDS', 'RESTORE_SINGLE_RECORD', 'SAVE_DASHBOARD_LAYOUT', 'SEARCH_RECORDS', 'SEARCH_RECORDS_FALLBACK', 'SEE_ACTIVE_VERSION_WORKFLOW', 'SEE_DELETED_RECORDS', 'SEE_RUNS_WORKFLOW', 'SEE_RUNS_WORKFLOW_VERSION', 'SEE_VERSIONS_WORKFLOW', 'SEE_VERSIONS_WORKFLOW_VERSION', 'SEE_VERSION_WORKFLOW_RUN', 'SEE_WORKFLOW_WORKFLOW_RUN', 'SEE_WORKFLOW_WORKFLOW_VERSION', 'STOP_WORKFLOW_RUN', 'TEST_WORKFLOW', 'TIDY_UP_WORKFLOW', 'TRIGGER_WORKFLOW_VERSION', 'UPDATE_MULTIPLE_RECORDS', 'USE_AS_DRAFT_WORKFLOW_VERSION', 'VIEW_PREVIOUS_AI_CHATS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" TYPE "core"."commandMenuItem_enginecomponentkey_enum" USING "engineComponentKey"::"core"."commandMenuItem_enginecomponentkey_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_WF_OR_FC_OR_ENGINE_KEY" CHECK (((("workflowVersionId" IS NOT NULL) AND ("frontComponentId" IS NULL) AND ("engineComponentKey" IS NULL)) OR (("workflowVersionId" IS NULL) AND ("frontComponentId" IS NOT NULL) AND ("engineComponentKey" IS NULL)) OR (("workflowVersionId" IS NULL) AND ("frontComponentId" IS NULL) AND ("engineComponentKey" IS NOT NULL))))`,
    );
  }
}
