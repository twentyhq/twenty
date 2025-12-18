import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { type ActionGroupConfig } from '@/command-menu/components/CommandMenu';
import { CommandMenuDefaultSelectionEffect } from '@/command-menu/components/CommandMenuDefaultSelectionEffect';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useSetRecoilState } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const MOBILE_NAVIGATION_BAR_HEIGHT = 64;

export type CommandMenuListProps = {
  commandGroups: ActionGroupConfig[];
  selectableItemIds: string[];
  children?: React.ReactNode;
  loading?: boolean;
  noResults?: boolean;
};

const StyledInnerList = styled.div`
  max-height: calc(
    100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px -
      ${COMMAND_MENU_SEARCH_BAR_PADDING * 2}px -
      ${MOBILE_NAVIGATION_BAR_HEIGHT}px
  );
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    max-height: calc(
      100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px -
        ${COMMAND_MENU_SEARCH_BAR_PADDING * 2}px
    );
  }
`;

const StyledCommandMenuList = styled.div`
  overflow-y: hidden;
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 64px;
  justify-content: center;
  white-space: pre-wrap;
`;

export const CommandMenuList = ({
  commandGroups,
  selectableItemIds,
  children,
  loading = false,
  noResults = false,
}: CommandMenuListProps) => {
  const setHasUserSelectedCommand = useSetRecoilState(
    hasUserSelectedCommandState,
  );

  return (
    <StyledCommandMenuList>
      <CommandMenuDefaultSelectionEffect
        selectableItemIds={selectableItemIds}
      />
      <ScrollWrapper componentInstanceId={`scroll-wrapper-command-menu`}>
        <StyledInnerList>
          <SelectableList
            selectableListInstanceId={COMMAND_MENU_LIST_SELECTABLE_LIST_ID}
            focusId={SIDE_PANEL_FOCUS_ID}
            selectableItemIdArray={selectableItemIds}
            onSelect={() => {
              setHasUserSelectedCommand(true);
            }}
          >
            {children}
            {commandGroups.map(({ heading, items }) =>
              items?.length ? (
                <CommandGroup heading={heading} key={heading}>
                  {items.map((item) => (
                    <ActionComponent action={item} key={item.key} />
                  ))}
                </CommandGroup>
              ) : null,
            )}
            {noResults && !loading && (
              <StyledEmpty>{t`No results found`}</StyledEmpty>
            )}
          </SelectableList>
        </StyledInnerList>
      </ScrollWrapper>
    </StyledCommandMenuList>
  );
};
