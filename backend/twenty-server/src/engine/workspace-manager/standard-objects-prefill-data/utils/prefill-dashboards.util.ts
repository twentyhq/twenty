import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';

export const MY_FIRST_DASHBOARD_ID = 'f31ecf3b-87d3-4e8a-a84b-b6f0f3f8c7e2';

export const prefillDashboards = async (
  entityManager: EntityManager,
  schemaName: string,
  flatPageLayoutMaps: FlatEntityMaps<FlatPageLayout>,
) => {
  const myFirstDashboardPageLayout = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatPageLayoutMaps,
    universalIdentifier:
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.universalIdentifier,
  });

  if (!isDefined(myFirstDashboardPageLayout)) {
    throw new Error(
      `Page layout with universalIdentifier '${STANDARD_PAGE_LAYOUTS.myFirstDashboard.universalIdentifier}' not found`,
    );
  }

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.dashboard`, [
      'id',
      'title',
      'pageLayoutId',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'createdByContext',
      'updatedBySource',
      'updatedByWorkspaceMemberId',
      'updatedByName',
      'updatedByContext',
    ])
    .orIgnore()
    .values([
      {
        id: MY_FIRST_DASHBOARD_ID,
        title: 'My First Dashboard',
        pageLayoutId: myFirstDashboardPageLayout.id,
        position: 0,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        createdByContext: {},
        updatedBySource: FieldActorSource.SYSTEM,
        updatedByWorkspaceMemberId: null,
        updatedByName: 'System',
        updatedByContext: {},
      },
    ])
    .returning('*')
    .execute();
};
