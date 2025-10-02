import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabActions } from '@/ui/layout/tab-list/types/TabActions';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { createRequiredContext } from '~/utils/createRequiredContext';

type TabOverflowState = {
  overflowCount: number;
  isActiveTabInOverflow: boolean;
};

type TablistDimensions = {
  width: number;
  height: number;
};

export type TabListContextValue = {
  visibleTabs: SingleTabProps[];
  visibleTabCount: number;
  overflowingTabs: SingleTabProps[];
  overflowCount: number;
  hasOverflowingTabs: boolean;
  overflow: TabOverflowState;
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
  tabActions?: TabActions;
  tabInRenameMode: string | null;
  onEnterRenameMode: (tabId: string) => void;
  onExitRenameMode: () => void;
};

export const [TabListContextProvider, useTabListContextOrThrow] =
  createRequiredContext<TabListContextValue>('TabListContext');
