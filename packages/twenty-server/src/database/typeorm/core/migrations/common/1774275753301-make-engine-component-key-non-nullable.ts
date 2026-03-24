import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeEngineComponentKeyNonNullable1774275753301
  implements MigrationInterface
{
  name = 'MakeEngineComponentKeyNonNullable1774275753301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "CHK_CMD_MENU_ITEM_WF_OR_FC_OR_ENGINE_KEY"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."commandMenuItem_enginecomponentkey_enum" RENAME TO "commandMenuItem_enginecomponentkey_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."commandMenuItem_enginecomponentkey_enum" AS ENUM('NAVIGATE_TO_NEXT_RECORD', 'NAVIGATE_TO_PREVIOUS_RECORD', 'CREATE_NEW_RECORD', 'DELETE_SINGLE_RECORD', 'DELETE_MULTIPLE_RECORDS', 'RESTORE_SINGLE_RECORD', 'RESTORE_MULTIPLE_RECORDS', 'DESTROY_SINGLE_RECORD', 'DESTROY_MULTIPLE_RECORDS', 'ADD_TO_FAVORITES', 'REMOVE_FROM_FAVORITES', 'EXPORT_NOTE_TO_PDF', 'EXPORT_FROM_RECORD_INDEX', 'EXPORT_FROM_RECORD_SHOW', 'UPDATE_MULTIPLE_RECORDS', 'MERGE_MULTIPLE_RECORDS', 'EXPORT_MULTIPLE_RECORDS', 'IMPORT_RECORDS', 'EXPORT_VIEW', 'SEE_DELETED_RECORDS', 'CREATE_NEW_VIEW', 'HIDE_DELETED_RECORDS', 'GO_TO_PEOPLE', 'GO_TO_COMPANIES', 'GO_TO_DASHBOARDS', 'GO_TO_OPPORTUNITIES', 'GO_TO_SETTINGS', 'GO_TO_TASKS', 'GO_TO_NOTES', 'EDIT_RECORD_PAGE_LAYOUT', 'EDIT_DASHBOARD_LAYOUT', 'SAVE_DASHBOARD_LAYOUT', 'CANCEL_DASHBOARD_LAYOUT', 'DUPLICATE_DASHBOARD', 'GO_TO_WORKFLOWS', 'ACTIVATE_WORKFLOW', 'DEACTIVATE_WORKFLOW', 'DISCARD_DRAFT_WORKFLOW', 'TEST_WORKFLOW', 'SEE_ACTIVE_VERSION_WORKFLOW', 'SEE_RUNS_WORKFLOW', 'SEE_VERSIONS_WORKFLOW', 'ADD_NODE_WORKFLOW', 'TIDY_UP_WORKFLOW', 'DUPLICATE_WORKFLOW', 'GO_TO_RUNS', 'SEE_VERSION_WORKFLOW_RUN', 'SEE_WORKFLOW_WORKFLOW_RUN', 'STOP_WORKFLOW_RUN', 'SEE_RUNS_WORKFLOW_VERSION', 'SEE_WORKFLOW_WORKFLOW_VERSION', 'USE_AS_DRAFT_WORKFLOW_VERSION', 'SEE_VERSIONS_WORKFLOW_VERSION', 'SEARCH_RECORDS', 'SEARCH_RECORDS_FALLBACK', 'ASK_AI', 'VIEW_PREVIOUS_AI_CHATS', 'TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" TYPE "core"."commandMenuItem_enginecomponentkey_enum" USING "engineComponentKey"::"text"::"core"."commandMenuItem_enginecomponentkey_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."commandMenuItem_enginecomponentkey_enum_old"`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' WHERE "engineComponentKey" IS NULL AND "workflowVersionId" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "engineComponentKey" = 'FRONT_COMPONENT_RENDERER' WHERE "engineComponentKey" IS NULL AND "frontComponentId" IS NOT NULL`,
    );
    await queryRunner.query(
      `DELETE FROM "core"."commandMenuItem" WHERE "engineComponentKey" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE" CHECK (("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" DROP NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "engineComponentKey" = NULL WHERE "engineComponentKey" IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."commandMenuItem_enginecomponentkey_enum_old" AS ENUM('ACTIVATE_WORKFLOW', 'ADD_NODE_WORKFLOW', 'ADD_TO_FAVORITES', 'ASK_AI', 'CANCEL_DASHBOARD_LAYOUT', 'CREATE_NEW_RECORD', 'CREATE_NEW_VIEW', 'DEACTIVATE_WORKFLOW', 'DELETE_MULTIPLE_RECORDS', 'DELETE_SINGLE_RECORD', 'DESTROY_MULTIPLE_RECORDS', 'DESTROY_SINGLE_RECORD', 'DISCARD_DRAFT_WORKFLOW', 'DUPLICATE_DASHBOARD', 'DUPLICATE_WORKFLOW', 'EDIT_DASHBOARD_LAYOUT', 'EDIT_RECORD_PAGE_LAYOUT', 'EXPORT_FROM_RECORD_INDEX', 'EXPORT_FROM_RECORD_SHOW', 'EXPORT_MULTIPLE_RECORDS', 'EXPORT_NOTE_TO_PDF', 'EXPORT_VIEW', 'GO_TO_COMPANIES', 'GO_TO_DASHBOARDS', 'GO_TO_NOTES', 'GO_TO_OPPORTUNITIES', 'GO_TO_PEOPLE', 'GO_TO_RUNS', 'GO_TO_SETTINGS', 'GO_TO_TASKS', 'GO_TO_WORKFLOWS', 'HIDE_DELETED_RECORDS', 'IMPORT_RECORDS', 'MERGE_MULTIPLE_RECORDS', 'NAVIGATE_TO_NEXT_RECORD', 'NAVIGATE_TO_PREVIOUS_RECORD', 'REMOVE_FROM_FAVORITES', 'RESTORE_MULTIPLE_RECORDS', 'RESTORE_SINGLE_RECORD', 'SAVE_DASHBOARD_LAYOUT', 'SEARCH_RECORDS', 'SEARCH_RECORDS_FALLBACK', 'SEE_ACTIVE_VERSION_WORKFLOW', 'SEE_DELETED_RECORDS', 'SEE_RUNS_WORKFLOW', 'SEE_RUNS_WORKFLOW_VERSION', 'SEE_VERSIONS_WORKFLOW', 'SEE_VERSIONS_WORKFLOW_VERSION', 'SEE_VERSION_WORKFLOW_RUN', 'SEE_WORKFLOW_WORKFLOW_RUN', 'SEE_WORKFLOW_WORKFLOW_VERSION', 'STOP_WORKFLOW_RUN', 'TEST_WORKFLOW', 'TIDY_UP_WORKFLOW', 'UPDATE_MULTIPLE_RECORDS', 'USE_AS_DRAFT_WORKFLOW_VERSION', 'VIEW_PREVIOUS_AI_CHATS')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "engineComponentKey" TYPE "core"."commandMenuItem_enginecomponentkey_enum_old" USING "engineComponentKey"::"text"::"core"."commandMenuItem_enginecomponentkey_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."commandMenuItem_enginecomponentkey_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."commandMenuItem_enginecomponentkey_enum_old" RENAME TO "commandMenuItem_enginecomponentkey_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_WF_OR_FC_OR_ENGINE_KEY" CHECK (((("workflowVersionId" IS NOT NULL) AND ("frontComponentId" IS NULL) AND ("engineComponentKey" IS NULL)) OR (("workflowVersionId" IS NULL) AND ("frontComponentId" IS NOT NULL) AND ("engineComponentKey" IS NULL)) OR (("workflowVersionId" IS NULL) AND ("frontComponentId" IS NULL) AND ("engineComponentKey" IS NOT NULL))))`,
    );
  }
}
