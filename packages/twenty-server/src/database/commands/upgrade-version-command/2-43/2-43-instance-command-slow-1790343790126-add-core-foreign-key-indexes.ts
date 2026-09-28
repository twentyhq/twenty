import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const CREATE_INDEX_QUERIES = [
  'CREATE INDEX IF NOT EXISTS "IDX_LOGIC_FUNCTION_APPLICATION_ID" ON "core"."logicFunction" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_GROUP_APPLICATION_ID" ON "core"."viewFieldGroup" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_VIEW_GROUP_APPLICATION_ID" ON "core"."viewGroup" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_VIEW_OBJECT_METADATA_ID_WORKSPACE_ID" ON "core"."view" ("objectMetadataId", "workspaceId")',
  'CREATE INDEX IF NOT EXISTS "IDX_VIEW_APPLICATION_ID" ON "core"."view" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_NAVIGATION_MENU_ITEM_TARGET_OBJECT_METADATA_ID" ON "core"."navigationMenuItem" ("targetObjectMetadataId") WHERE "targetObjectMetadataId" IS NOT NULL',
  'CREATE INDEX IF NOT EXISTS "IDX_NAVIGATION_MENU_ITEM_APPLICATION_ID" ON "core"."navigationMenuItem" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_PAGE_LAYOUT_WIDGET_APPLICATION_ID" ON "core"."pageLayoutWidget" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_PAGE_LAYOUT_TAB_APPLICATION_ID" ON "core"."pageLayoutTab" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_PAGE_LAYOUT_DEFAULT_TAB_TO_FOCUS_ID" ON "core"."pageLayout" ("defaultTabToFocusOnMobileAndSidePanelId") WHERE "defaultTabToFocusOnMobileAndSidePanelId" IS NOT NULL',
  'CREATE INDEX IF NOT EXISTS "IDX_PAGE_LAYOUT_OBJECT_METADATA_ID_WORKSPACE_ID" ON "core"."pageLayout" ("objectMetadataId", "workspaceId") WHERE "objectMetadataId" IS NOT NULL',
  'CREATE INDEX IF NOT EXISTS "IDX_PAGE_LAYOUT_APPLICATION_ID" ON "core"."pageLayout" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_COMMAND_MENU_ITEM_APPLICATION_ID" ON "core"."commandMenuItem" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_SEARCH_FIELD_METADATA_TS_VECTOR_FIELD_METADATA_ID" ON "core"."searchFieldMetadata" ("tsVectorFieldMetadataId")',
  'CREATE INDEX IF NOT EXISTS "IDX_SEARCH_FIELD_METADATA_APPLICATION_ID" ON "core"."searchFieldMetadata" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_OBJECT_METADATA_APPLICATION_ID" ON "core"."objectMetadata" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_INDEX_METADATA_APPLICATION_ID" ON "core"."indexMetadata" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_INDEX_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID" ON "core"."indexMetadata" ("objectMetadataId", "workspaceId")',
  'CREATE INDEX IF NOT EXISTS "IDX_INDEX_FIELD_METADATA_INDEX_METADATA_ID" ON "core"."indexFieldMetadata" ("indexMetadataId")',
  'CREATE INDEX IF NOT EXISTS "IDX_FIELD_METADATA_APPLICATION_ID" ON "core"."fieldMetadata" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_VIEW_FIELD_APPLICATION_ID" ON "core"."viewField" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_APP_TOKEN_WORKSPACE_ID" ON "core"."appToken" ("workspaceId") WHERE "workspaceId" IS NOT NULL',
  'CREATE INDEX IF NOT EXISTS "IDX_APP_TOKEN_USER_ID" ON "core"."appToken" ("userId") WHERE "userId" IS NOT NULL',
  'CREATE INDEX IF NOT EXISTS "IDX_SKILL_APPLICATION_ID" ON "core"."skill" ("applicationId")',
  'CREATE INDEX IF NOT EXISTS "IDX_MESSAGE_FOLDER_WORKSPACE_ID" ON "core"."messageFolder" ("workspaceId")',
  'CREATE INDEX IF NOT EXISTS "IDX_MESSAGE_FOLDER_MESSAGE_CHANNEL_ID" ON "core"."messageFolder" ("messageChannelId")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_FILE_APPLICATION_ID_WORKSPACE_ID_PATH_UNIQUE" ON "core"."file" ("applicationId", "workspaceId", "path")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_SEARCH_FIELD_METADATA_FIELD_OBJECT_UNIQUE" ON "core"."searchFieldMetadata" ("fieldMetadataId", "objectMetadataId")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_TIMELINE_ACTIVITY_TYPE_APPLICATION_WORKSPACE_NAME_UNIQUE" ON "core"."timelineActivityType" ("applicationId", "workspaceId", "name")',
];

@RegisteredInstanceCommand('2.43.0', 1790343790126, { type: 'slow' })
export class AddCoreForeignKeyIndexesSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const query of CREATE_INDEX_QUERIES) {
      await dataSource.query(query.replace(/ INDEX /, ' INDEX CONCURRENTLY '));
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const query of CREATE_INDEX_QUERIES) {
      await queryRunner.query(query);
    }

    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "IDX_SEARCH_FIELD_METADATA_OBJECT_FIELD_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" DROP CONSTRAINT "IDX_TIMELINE_ACTIVITY_TYPE_NAME_APPLICATION_WORKSPACE_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_FILE_APPLICATION_ID_WORKSPACE_ID_PATH_UNIQUE" UNIQUE USING INDEX "IDX_FILE_APPLICATION_ID_WORKSPACE_ID_PATH_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "IDX_SEARCH_FIELD_METADATA_FIELD_OBJECT_UNIQUE" UNIQUE USING INDEX "IDX_SEARCH_FIELD_METADATA_FIELD_OBJECT_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" ADD CONSTRAINT "IDX_TIMELINE_ACTIVITY_TYPE_APPLICATION_WORKSPACE_NAME_UNIQUE" UNIQUE USING INDEX "IDX_TIMELINE_ACTIVITY_TYPE_APPLICATION_WORKSPACE_NAME_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_FILE_APPLICATION_REGISTRATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_SEARCH_FIELD_METADATA_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_METADATA_OBJECT_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_METADATA_WORKSPACE_ID"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" DROP CONSTRAINT "IDX_TIMELINE_ACTIVITY_TYPE_APPLICATION_WORKSPACE_NAME_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "IDX_SEARCH_FIELD_METADATA_FIELD_OBJECT_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."file" DROP CONSTRAINT "IDX_FILE_APPLICATION_ID_WORKSPACE_ID_PATH_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_MESSAGE_FOLDER_MESSAGE_CHANNEL_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_MESSAGE_FOLDER_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_SKILL_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_APP_TOKEN_USER_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_APP_TOKEN_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_FIELD_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_METADATA_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_INDEX_FIELD_METADATA_INDEX_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_INDEX_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_INDEX_METADATA_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_OBJECT_METADATA_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_SEARCH_FIELD_METADATA_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_SEARCH_FIELD_METADATA_TS_VECTOR_FIELD_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_COMMAND_MENU_ITEM_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAGE_LAYOUT_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAGE_LAYOUT_OBJECT_METADATA_ID_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAGE_LAYOUT_DEFAULT_TAB_TO_FOCUS_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAGE_LAYOUT_TAB_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PAGE_LAYOUT_WIDGET_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_NAVIGATION_MENU_ITEM_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_NAVIGATION_MENU_ITEM_TARGET_OBJECT_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_OBJECT_METADATA_ID_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_GROUP_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_FIELD_GROUP_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_LOGIC_FUNCTION_APPLICATION_ID"');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" ADD CONSTRAINT "IDX_TIMELINE_ACTIVITY_TYPE_NAME_APPLICATION_WORKSPACE_UNIQUE" UNIQUE ("name", "applicationId", "workspaceId")');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "IDX_SEARCH_FIELD_METADATA_OBJECT_FIELD_UNIQUE" UNIQUE ("objectMetadataId", "fieldMetadataId")');
    await queryRunner.query('ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE" UNIQUE ("workspaceId", "applicationId", "path")');
    await queryRunner.query('CREATE INDEX "IDX_FIELD_METADATA_WORKSPACE_ID" ON "core"."fieldMetadata" ("workspaceId") ');
    await queryRunner.query('CREATE INDEX "IDX_FIELD_METADATA_OBJECT_METADATA_ID" ON "core"."fieldMetadata" ("objectMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."indexMetadata" ("workspaceId", "objectMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_SEARCH_FIELD_METADATA_WORKSPACE_ID" ON "core"."searchFieldMetadata" ("workspaceId") ');
    await queryRunner.query('CREATE INDEX "IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."pageLayout" ("workspaceId", "objectMetadataId") WHERE ("deletedAt" IS NULL)');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."view" ("workspaceId", "objectMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_FILE_APPLICATION_REGISTRATION_ID" ON "core"."file" ("applicationRegistrationId") ');
  }
}
