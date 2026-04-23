import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ForeignKeyIndexStandardization1768750308557
  implements MigrationInterface
{
  name = 'ForeignKeyIndexStandardization1768750308557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FILTER_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_GROUP_VIEW_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_GROUP_VIEW_ID"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_SORT_VIEW_ID"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FIELD_VIEW_ID"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLE_TARGET_ROLE_ID" ON "core"."roleTarget" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPP_WORKSPACE_MEMBER_FIELD_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("workspaceMemberFieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPPG_PARENT_GROUP_ID" ON "core"."rowLevelPermissionPredicateGroup" ("parentRowLevelPermissionPredicateGroupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_VIEW_ID" ON "core"."viewFilter" ("viewId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_GROUP_PARENT_ID" ON "core"."viewFilterGroup" ("parentViewFilterGroupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_GROUP_VIEW_ID" ON "core"."viewFilterGroup" ("viewId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_GROUP_VIEW_ID" ON "core"."viewGroup" ("viewId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_SORT_FIELD_METADATA_ID" ON "core"."viewSort" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_SORT_VIEW_ID" ON "core"."viewSort" ("viewId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_CREATED_BY_USER_WORKSPACE" ON "core"."view" ("createdByUserWorkspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_MAIN_GROUP_BY_FIELD_METADATA" ON "core"."view" ("mainGroupByFieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_KANBAN_FIELD_METADATA" ON "core"."view" ("kanbanAggregateOperationFieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_CALENDAR_FIELD_METADATA" ON "core"."view" ("calendarFieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_FIELD_METADATA_ID" ON "core"."viewField" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_VIEW_ID" ON "core"."viewField" ("viewId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_OBJECT_METADATA_DATA_SOURCE_ID" ON "core"."objectMetadata" ("dataSourceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CRON_TRIGGER_SERVERLESS_FUNCTION_ID" ON "core"."cronTrigger" ("serverlessFunctionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_DATABASE_EVENT_TRIGGER_SERVERLESS_FUNCTION_ID" ON "core"."databaseEventTrigger" ("serverlessFunctionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROUTE_TRIGGER_SERVERLESS_FUNCTION_ID" ON "core"."routeTrigger" ("serverlessFunctionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SERVERLESS_FUNCTION_LAYER_ID" ON "core"."serverlessFunction" ("serverlessFunctionLayerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WIDGET_OBJECT_METADATA_ID" ON "core"."pageLayoutWidget" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COMMAND_MENU_ITEM_AVAILABILITY_OBJECT_METADATA_ID" ON "core"."commandMenuItem" ("availabilityObjectMetadataId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_COMMAND_MENU_ITEM_AVAILABILITY_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WIDGET_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_SERVERLESS_FUNCTION_LAYER_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_ROUTE_TRIGGER_SERVERLESS_FUNCTION_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DATABASE_EVENT_TRIGGER_SERVERLESS_FUNCTION_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_CRON_TRIGGER_SERVERLESS_FUNCTION_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_OBJECT_METADATA_DATA_SOURCE_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FIELD_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_CALENDAR_FIELD_METADATA"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_KANBAN_FIELD_METADATA"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_MAIN_GROUP_BY_FIELD_METADATA"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_CREATED_BY_USER_WORKSPACE"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_SORT_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_SORT_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_GROUP_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_GROUP_VIEW_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_GROUP_PARENT_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FILTER_VIEW_ID"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_RLPPG_PARENT_GROUP_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_RLPP_WORKSPACE_MEMBER_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_ROLE_TARGET_ROLE_ID"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_VIEW_ID" ON "core"."viewField" ("viewId") WHERE ("deletedAt" IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_SORT_VIEW_ID" ON "core"."viewSort" ("viewId") WHERE ("deletedAt" IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_GROUP_VIEW_ID" ON "core"."viewGroup" ("viewId") WHERE ("deletedAt" IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_GROUP_VIEW_ID" ON "core"."viewFilterGroup" ("viewId") WHERE ("deletedAt" IS NULL)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_VIEW_ID" ON "core"."viewFilter" ("viewId") WHERE ("deletedAt" IS NULL)`,
    );
  }
}
