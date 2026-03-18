import { type QueryRunner } from 'typeorm';

export const makeNavigationMenuItemTypeNotNullQueries = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  await queryRunner.query(
    `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" SET NOT NULL`,
  );

  await queryRunner.query(
    `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (
      ("type" = 'FOLDER')
      OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL)
      OR ("type" = 'VIEW' AND "viewId" IS NOT NULL)
      OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL)
      OR ("type" = 'LINK' AND "link" IS NOT NULL)
    )`,
  );
};
