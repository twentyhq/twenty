import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { Button, useIsMobile } from 'twenty-ui';

const MOBILE_NAVIGATION_BAR_HEIGHT = 64;

export type ActionsListProps = {
  entries: ActionMenuEntry[];
  filtering: boolean;
  isLoading: boolean;
  isShowingDetail: boolean;
  navigationTitle: string;
  pagination: { hasMore: boolean; pageSize: number; onLoadMore: () => void };
  searchBarPlaceholder: string;
  searchText: string;
  selectedItemId: string;
  throttle: boolean;
  onSearchTextChange: (text: string) => void;
  onSelectionChange: (id: string) => void;
};

const StyledList = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
`;

const StyledInnerList = styled.div<{ isMobile: boolean }>`
  max-height: ${({ isMobile }) =>
    isMobile
      ? `calc(100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px - ${
          COMMAND_MENU_SEARCH_BAR_PADDING * 2
        }px - ${MOBILE_NAVIGATION_BAR_HEIGHT}px)`
      : `calc(100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px - ${
          COMMAND_MENU_SEARCH_BAR_PADDING * 2
        }px)`};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

export const ActionsList = ({
  entries,
  filtering,
  isLoading,
  isShowingDetail,
  navigationTitle,
  pagination,
  searchBarPlaceholder,
  searchText,
  selectedItemId,
  throttle,
  onSearchTextChange,
  onSelectionChange,
}: ActionsListProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledList>
      <ScrollWrapper
        contextProviderName="commandMenu"
        componentInstanceId={`scroll-wrapper-command-menu`}
      >
        <StyledInnerList isMobile={isMobile}>
          <SelectableList
            selectableListId="actions-list"
            hotkeyScope={AppHotkeyScope.CommandMenuOpen}
          >
            <SelectableItem itemId="">
              <Button>Test</Button>
            </SelectableItem>
          </SelectableList>
        </StyledInnerList>
      </ScrollWrapper>
    </StyledList>
  );
};
