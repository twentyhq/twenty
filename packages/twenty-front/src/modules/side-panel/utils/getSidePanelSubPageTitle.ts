import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getSidePanelSubPageTitle = (
  subPage: SidePanelSubPages,
): string => {
  switch (subPage) {
    case SidePanelSubPages.PageLayoutGraphFilter:
      return t`Filters`;
    case SidePanelSubPages.PageLayoutFieldsLayout:
      return t`Layout`;
    case SidePanelSubPages.NewSidebarItemViewObjectPicker:
      return t`Pick an object`;
    case SidePanelSubPages.NewSidebarItemViewPicker:
      return t`Pick a view`;
    case SidePanelSubPages.NewSidebarItemViewSystemPicker:
      return t`System objects`;
    case SidePanelSubPages.NewSidebarItemObjectPicker:
      return t`Pick an object`;
    case SidePanelSubPages.NewSidebarItemObjectSystemPicker:
      return t`System objects`;
    case SidePanelSubPages.NewSidebarItemRecord:
      return t`Add a record`;
    case SidePanelSubPages.EditFolderPicker:
      return t`Move to a folder`;
    default:
      assertUnreachable(subPage);
  }
};
