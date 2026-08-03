import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

// Matches on the widget rather than the tab title or id so a renamed or
// reordered Tasks tab keeps its count.
const isTasksTab = (tab: PageLayoutTab): boolean =>
  tab.widgets.some((widget) => widget.type === WidgetType.TASKS);

export const getPageLayoutTabTitleWithOpenTaskCount = ({
  tab,
  openTaskCount,
}: {
  tab: PageLayoutTab;
  openTaskCount: number | undefined;
}): string => {
  // A zero count reads as noise on every task-free contact, so it stays hidden.
  if (!isDefined(openTaskCount) || openTaskCount === 0 || !isTasksTab(tab)) {
    return tab.title;
  }

  return `${tab.title} (${openTaskCount})`;
};
