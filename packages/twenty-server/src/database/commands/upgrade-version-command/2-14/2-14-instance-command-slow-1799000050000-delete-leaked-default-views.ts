import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Between 2.13.0 and 2.14.0, useCreateDefaultViewForObject (a temporary
// runtime fallback) leaked core.view + core.viewField rows on every
// record-index load: each created view got a fresh id that never matched the
// requested contextStoreCurrentViewId, so the next load missed again and
// re-created another duplicate view (plus ~one viewField per field) without
// bound. See the root-cause fix in useCreateDefaultViewForObject.
//
// This deletes those leaked rows. A leaked view is recognized by the exact
// shape the fallback produced — and is only removed when the object keeps at
// least one other view, so no object is ever left view-less:
//   - key IS NULL            (real default/index views are key = 'INDEX')
//   - isCustom = false
//   - overrides IS NULL
//   - no filter / sort / group / field-group / filter-group  (bare)
//   - not referenced by a navigationMenuItem                 (not in the nav)
// Deleting the view cascades to its viewField (and any other) children.

const DELETE_BATCH_SIZE = 5000;

const LEAKED_DEFAULT_VIEW_IDS_TO_DELETE = `
  WITH candidate AS (
    SELECT v.id, v."workspaceId", v."objectMetadataId", v."createdAt"
    FROM core.view v
    WHERE v."deletedAt" IS NULL
      AND v.key IS NULL
      AND v."isCustom" = false
      AND v.overrides IS NULL
      AND NOT EXISTS (SELECT 1 FROM core."viewFilter" f WHERE f."viewId" = v.id)
      AND NOT EXISTS (SELECT 1 FROM core."viewSort" s WHERE s."viewId" = v.id)
      AND NOT EXISTS (SELECT 1 FROM core."viewGroup" g WHERE g."viewId" = v.id)
      AND NOT EXISTS (SELECT 1 FROM core."viewFieldGroup" fg WHERE fg."viewId" = v.id)
      AND NOT EXISTS (SELECT 1 FROM core."viewFilterGroup" flg WHERE flg."viewId" = v.id)
      AND NOT EXISTS (SELECT 1 FROM core."navigationMenuItem" n WHERE n."viewId" = v.id)
  ),
  object_has_real_sibling AS (
    SELECT DISTINCT v."workspaceId", v."objectMetadataId"
    FROM core.view v
    WHERE v."deletedAt" IS NULL
      AND NOT EXISTS (SELECT 1 FROM candidate c WHERE c.id = v.id)
  ),
  ranked AS (
    SELECT
      c.id,
      row_number() OVER (
        PARTITION BY c."workspaceId", c."objectMetadataId"
        ORDER BY c."createdAt" ASC, c.id ASC
      ) AS rn,
      (s."workspaceId" IS NOT NULL) AS object_has_real_sibling
    FROM candidate c
    LEFT JOIN object_has_real_sibling s
      ON s."workspaceId" = c."workspaceId"
     AND s."objectMetadataId" = c."objectMetadataId"
  )
  SELECT id
  FROM ranked
  WHERE object_has_real_sibling = true OR rn > 1
  LIMIT $1
`;

@RegisteredInstanceCommand('2.14.0', 1799000050000, { type: 'slow' })
export class DeleteLeakedDefaultViewsSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    DeleteLeakedDefaultViewsSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    let totalDeleted = 0;

    // Batched so we never hold a single huge transaction / long lock on a
    // table that may have accumulated millions of leaked rows.
    while (true) {
      const rows: { id: string }[] = await dataSource.query(
        LEAKED_DEFAULT_VIEW_IDS_TO_DELETE,
        [DELETE_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      const ids = rows.map((row) => row.id);

      // viewField and the other view children cascade-delete with the view.
      await dataSource.query(`DELETE FROM core.view WHERE id = ANY($1)`, [ids]);

      totalDeleted += ids.length;
    }

    this.logger.log(`Deleted ${totalDeleted} leaked default view(s)`);
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
