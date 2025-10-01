import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { createRequiredContext } from '~/utils/createRequiredContext';

type TabOverflow = {
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
};

type TablistDimensions = {
  width: number;
  height: number;
};

export type TabListStateContextValue = {
  visibleTabs: SingleTabProps[];
  visibleTabCount: number;
  hiddenTabs: SingleTabProps[];
  hiddenTabsCount: number;
  hasHiddenTabs: boolean;
  overflow: TabOverflow;
  activeTabId: string | null;
  loading?: boolean;
  behaveAsLinks: boolean;
  className?: string;
  dropdownId: string;
  onAddTab?: () => void;
  onTabSelect: (tabId: string) => void;
  onTabSelectFromDropdown: (tabId: string) => void;
  onContainerWidthChange: (dimensions: TablistDimensions) => void;
  onTabWidthChange: (tabId: string) => (dimensions: TablistDimensions) => void;
  onMoreButtonWidthChange: (dimensions: TablistDimensions) => void;
  onAddButtonWidthChange: (dimensions: TablistDimensions) => void;
  isDragAndDropEnabled: boolean;
  onDragEnd?: OnDragEndResponder;
};

export const [TabListStateContextProvider, useTabListStateContextOrThrow] =
  createRequiredContext<TabListStateContextValue>('TabListStateContext');
