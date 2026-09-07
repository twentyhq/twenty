import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type GetIsSingleWidgetTabParams = {
  tab: Pick<PageLayoutTab, 'layoutMode' | 'widgets'>;
};

export const getIsSingleWidgetTab = ({
  tab,
}: GetIsSingleWidgetTabParams): boolean =>
  tab.layoutMode !== PageLayoutTabLayoutMode.GRID &&
  tab.widgets.filter((widget) => widget.isActive).length === 1;
