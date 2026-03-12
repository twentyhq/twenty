import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEngineComponentKeyToCommandMenuItem1773311456455 implements MigrationInterface {
    name = 'AddEngineComponentKeyToCommandMenuItem1773311456455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "CHK_command_menu_item_workflow_or_front_component"`);
        await queryRunner.query(`CREATE TYPE "core"."commandMenuItem_enginecomponentkey_enum" AS ENUM('CREATE_NEW_RECORD', 'DELETE_SINGLE_RECORD', 'DELETE_MULTIPLE_RECORDS', 'RESTORE_SINGLE_RECORD', 'RESTORE_MULTIPLE_RECORDS', 'DESTROY_SINGLE_RECORD', 'DESTROY_MULTIPLE_RECORDS', 'ADD_TO_FAVORITES', 'REMOVE_FROM_FAVORITES', 'MERGE_MULTIPLE_RECORDS', 'DUPLICATE_DASHBOARD', 'DUPLICATE_WORKFLOW', 'ACTIVATE_WORKFLOW', 'DEACTIVATE_WORKFLOW', 'DISCARD_DRAFT_WORKFLOW', 'TEST_WORKFLOW', 'STOP_WORKFLOW_RUN', 'USE_AS_DRAFT_WORKFLOW_VERSION', 'SAVE_RECORD_PAGE_LAYOUT', 'SAVE_DASHBOARD_LAYOUT', 'TIDY_UP_WORKFLOW')`);
        await queryRunner.query(`ALTER TABLE "core"."commandMenuItem" ADD "engineComponentKey" "core"."commandMenuItem_enginecomponentkey_enum"`);
        await queryRunner.query(`ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_cmd_menu_item_wf_or_front_comp_or_engine_key" CHECK (("workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "engineComponentKey" IS NULL) OR ("workflowVersionId" IS NULL AND "frontComponentId" IS NOT NULL AND "engineComponentKey" IS NULL) OR ("workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "engineComponentKey" IS NOT NULL))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "CHK_cmd_menu_item_wf_or_front_comp_or_engine_key"`);
        await queryRunner.query(`ALTER TABLE "core"."commandMenuItem" DROP COLUMN "engineComponentKey"`);
        await queryRunner.query(`DROP TYPE "core"."commandMenuItem_enginecomponentkey_enum"`);
        await queryRunner.query(`ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_command_menu_item_workflow_or_front_component" CHECK (((("workflowVersionId" IS NOT NULL) AND ("frontComponentId" IS NULL)) OR (("workflowVersionId" IS NULL) AND ("frontComponentId" IS NOT NULL))))`);
    }

}
