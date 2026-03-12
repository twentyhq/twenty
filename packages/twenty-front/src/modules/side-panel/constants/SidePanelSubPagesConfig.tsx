import { SidePanelEditFolderPickerSubPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditFolderPickerSubPage';
import { SidePanelNewSidebarItemObjectSubPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemObjectSubPage';
import { SidePanelNewSidebarItemObjectSystemPickerSubPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemObjectSystemPickerSubPage';
import { SidePanelNewSidebarItemRecordSubPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemRecordSubPage';
import { SidePanelNewSidebarItemViewObjectPickerSubPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewObjectPickerSubPage';
import { SidePanelNewSidebarItemViewPickerSubPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewPickerSubPage';
import { SidePanelNewSidebarItemViewSystemPickerSubPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewSystemPickerSubPage';
import { SidePanelChartFilterSubPage } from '@/side-panel/pages/page-layout/components/SidePanelChartFilterSubPage';
import { SidePanelFieldsLayoutSubPage } from '@/side-panel/pages/page-layout/components/SidePanelFieldsLayoutSubPage';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import React from 'react';

export const SIDE_PANEL_SUB_PAGES_CONFIG = new Map<
  SidePanelSubPages,
  React.ReactNode
>([
  [SidePanelSubPages.PageLayoutGraphFilter, <SidePanelChartFilterSubPage />],
  [SidePanelSubPages.PageLayoutFieldsLayout, <SidePanelFieldsLayoutSubPage />],
  [
    SidePanelSubPages.NewSidebarItemViewObjectPicker,
    <SidePanelNewSidebarItemViewObjectPickerSubPage />,
  ],
  [
    SidePanelSubPages.NewSidebarItemViewPicker,
    <SidePanelNewSidebarItemViewPickerSubPage />,
  ],
  [
    SidePanelSubPages.NewSidebarItemViewSystemPicker,
    <SidePanelNewSidebarItemViewSystemPickerSubPage />,
  ],
  [
    SidePanelSubPages.NewSidebarItemObjectPicker,
    <SidePanelNewSidebarItemObjectSubPage />,
  ],
  [
    SidePanelSubPages.NewSidebarItemObjectSystemPicker,
    <SidePanelNewSidebarItemObjectSystemPickerSubPage />,
  ],
  [
    SidePanelSubPages.NewSidebarItemRecord,
    <SidePanelNewSidebarItemRecordSubPage />,
  ],
  [SidePanelSubPages.EditFolderPicker, <SidePanelEditFolderPickerSubPage />],
]);
