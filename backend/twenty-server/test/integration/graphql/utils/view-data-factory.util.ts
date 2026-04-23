import {
  ViewFilterGroupLogicalOperator,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const createViewData = (overrides: Partial<ViewEntity> = {}) => ({
  name: 'Test View',
  icon: 'IconTable',
  type: ViewType.TABLE,
  key: null,
  position: 0,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  visibility: ViewVisibility.WORKSPACE,
  ...overrides,
});

export const createViewSortData = (
  viewId: string,
  overrides: Partial<ViewSortEntity> = {},
) => ({
  viewId,
  direction: ViewSortDirection.ASC,
  ...overrides,
});

export const updateViewSortData = (
  overrides: Partial<ViewSortEntity> = {},
) => ({
  direction: ViewSortDirection.DESC,
  ...overrides,
});

export const createViewFilterGroupData = (
  viewId: string,
  overrides: Partial<ViewFilterGroupEntity> = {},
) => ({
  viewId,
  logicalOperator: ViewFilterGroupLogicalOperator.AND,
  ...overrides,
});

export const updateViewFilterGroupData = (
  overrides: Partial<ViewFilterGroupEntity> = {},
) => ({
  logicalOperator: ViewFilterGroupLogicalOperator.OR,
  ...overrides,
});
