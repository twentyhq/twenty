import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID_INDEX_NAME =
  'IDX_PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID';
const PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID_INDEX_NAME =
  'IDX_PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID';

@RegisteredInstanceCommand('2.25.0', 1784904030251)
export class AddPageLayoutCascadeDeleteIndexesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "${PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID_INDEX_NAME}" ON "core"."pageLayoutTab" ("pageLayoutId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "${PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID_INDEX_NAME}" ON "core"."pageLayoutWidget" ("pageLayoutTabId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${PAGE_LAYOUT_WIDGET_PAGE_LAYOUT_TAB_ID_INDEX_NAME}"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${PAGE_LAYOUT_TAB_PAGE_LAYOUT_ID_INDEX_NAME}"`,
    );
  }
}
