import { SidePanelCommandMenuItemVisibilitySubPage } from '@/command-menu-item/edit/components/SidePanelCommandMenuItemVisibilitySubPage';
import { SidePanelChartFilterSubPage } from '@/side-panel/pages/page-layout/components/SidePanelChartFilterSubPage';
import { SidePanelFieldRelationTableFieldsSubPage } from '@/side-panel/pages/page-layout/components/SidePanelFieldRelationTableFieldsSubPage';
import { SidePanelFieldVisibilitySubPage } from '@/side-panel/pages/page-layout/components/SidePanelFieldVisibilitySubPage';
import { SidePanelFieldsLayoutSubPage } from '@/side-panel/pages/page-layout/components/SidePanelFieldsLayoutSubPage';
import { SidePanelTabVisibilitySubPage } from '@/side-panel/pages/page-layout/components/SidePanelTabVisibilitySubPage';
import { SidePanelWidgetVisibilitySubPage } from '@/side-panel/pages/page-layout/components/SidePanelWidgetVisibilitySubPage';
import { SidePanelRecordTableFilterSubPage } from '@/side-panel/pages/page-layout/components/record-table-settings/SidePanelRecordTableFilterSubPage';
import { SidePanelRecordTableSortSubPage } from '@/side-panel/pages/page-layout/components/record-table-settings/SidePanelRecordTableSortSubPage';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import React from 'react';

export const SIDE_PANEL_SUB_PAGES_CONFIG = new Map<
  SidePanelSubPages,
  React.ReactNode
>([
  [SidePanelSubPages.PageLayoutGraphFilter, <SidePanelChartFilterSubPage />],
  [SidePanelSubPages.PageLayoutFieldsLayout, <SidePanelFieldsLayoutSubPage />],
  [
    SidePanelSubPages.PageLayoutRecordTableFilter,
    <SidePanelRecordTableFilterSubPage />,
  ],
  [
    SidePanelSubPages.PageLayoutRecordTableSort,
    <SidePanelRecordTableSortSubPage />,
  ],
  [
    SidePanelSubPages.PageLayoutFieldRelationTableFields,
    <SidePanelFieldRelationTableFieldsSubPage />,
  ],
  [
    SidePanelSubPages.PageLayoutWidgetVisibility,
    <SidePanelWidgetVisibilitySubPage />,
  ],
  [
    SidePanelSubPages.PageLayoutTabVisibility,
    <SidePanelTabVisibilitySubPage />,
  ],
  [
    SidePanelSubPages.PageLayoutFieldVisibility,
    <SidePanelFieldVisibilitySubPage />,
  ],
  [
    SidePanelSubPages.CommandMenuItemVisibility,
    <SidePanelCommandMenuItemVisibilitySubPage />,
  ],
]);
