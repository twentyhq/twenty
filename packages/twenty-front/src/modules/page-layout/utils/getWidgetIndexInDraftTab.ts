import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';

type GetWidgetIndexInDraftTabParams = {
  tab: Pick<PageLayoutTab, 'widgets'>;
  widgetId: string;
};

export const getWidgetIndexInDraftTab = ({
  tab,
  widgetId,
}: GetWidgetIndexInDraftTabParams): number =>
  sortWidgetsByVerticalListPosition(tab.widgets).findIndex(
    (widget) => widget.id === widgetId,
  );
