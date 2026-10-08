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
    case SidePanelSubPages.PageLayoutRecordTableFilter:
      return t`Filters`;
    case SidePanelSubPages.PageLayoutRecordTableSort:
      return t`Sorts`;
    case SidePanelSubPages.PageLayoutFieldRelationTableFields:
      return t`Fields`;
    default:
      assertUnreachable(subPage);
  }
};
