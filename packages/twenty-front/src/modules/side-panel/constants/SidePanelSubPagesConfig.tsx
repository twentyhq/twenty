import { SidePanelEditFolderPickerSubPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditFolderPickerSubPage';
import { SidePanelNewSidebarItemObjectSubPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemObjectSubPage';
import { SidePanelNewSidebarItemObjectSystemPickerSubPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemObjectSystemPickerSubPage';
import { SidePanelNewSidebarItemRecordSubPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemRecordSubPage';
import { SidePanelNewSidebarItemViewObjectPickerSubPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemViewObjectPickerSubPage';
import { SidePanelNewSidebarItemViewPickerSubPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemViewPickerSubPage';
import { SidePanelNewSidebarItemViewSystemPickerSubPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemViewSystemPickerSubPage';
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
