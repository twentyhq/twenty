import { PageLayoutTabWidgetDropTarget } from '@/page-layout/components/dnd/PageLayoutTabWidgetDropTarget';
import { PAGE_LAYOUT_TAB_DND_TYPE } from '@/page-layout/constants/PageLayoutTabDndType';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTabDragData } from '@/page-layout/types/PageLayoutTabDragData';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabListDragHandle } from '@/page-layout/components/PageLayoutTabListDragHandle';
import { PageLayoutType } from '~/generated-metadata/graphql';

type PageLayoutTabListReorderableTabProps = {
  tab: SingleTabProps;
  index: number;
  group: string;
  nextTabId: string | null;
  isActive: boolean;
  disabled?: boolean;
  widgetDropTargetWidgets?: PageLayoutWidget[];
  onSelect: () => void;
};

export const PageLayoutTabListReorderableTab = ({
  tab,
  index,
  group,
  nextTabId,
  isActive,
  disabled,
  widgetDropTargetWidgets,
  onSelect,
}: PageLayoutTabListReorderableTabProps) => {
  const { layoutType } = useLayoutRenderingContext();
  const pageLayoutTabSettingsOpenTabId = useAtomComponentStateValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );

  const isHighlighted =
    layoutType === PageLayoutType.RECORD_PAGE
      ? isActive
      : pageLayoutTabSettingsOpenTabId === tab.id;

  const tabDragData: PageLayoutTabDragData = {
    type: 'tab',
    tabId: tab.id,
    nextTabId,
  };

  const draggableTab = (
    <DragDropItemSortableCell
      id={tab.id}
      index={index}
      group={group}
      data={tabDragData}
      type={PAGE_LAYOUT_TAB_DND_TYPE}
      accept={PAGE_LAYOUT_TAB_DND_TYPE}
      disabled={disabled}
      fill
      hasTransition={false}
      orientation="vertical"
    >
      <PageLayoutTabListDragHandle
        asTab
        id={tab.id}
        active={isActive}
        disabled={disabled}
        LeftIcon={tab.Icon}
        title={tab.title}
        logo={tab.logo}
        pill={tab.pill}
        isHighlighted={isHighlighted}
        onClick={onSelect}
      />
    </DragDropItemSortableCell>
  );

  if (!isDefined(widgetDropTargetWidgets)) {
    return draggableTab;
  }

  return (
    <PageLayoutTabWidgetDropTarget
      tabId={tab.id}
      destinationWidgets={widgetDropTargetWidgets}
    >
      {draggableTab}
    </PageLayoutTabWidgetDropTarget>
  );
};
