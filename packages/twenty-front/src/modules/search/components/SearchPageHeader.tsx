import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconSearch } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { SearchPageCollapseButton } from '@/search/components/SearchPageCollapseButton';
import { SEARCH_PAGE_FOCUS_ID } from '@/search/constants/SearchPageFocusId';
import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { SIDE_PANEL_TOP_BAR_HEIGHT } from '@/side-panel/constants/SidePanelTopBarHeight';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const StyledHeader = styled.header`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${SIDE_PANEL_TOP_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledSearchIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledInput = styled.input`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  height: 24px;
  margin: 0;
  min-width: 0;
  outline: none;
  padding: 0;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;

type SearchPageHeaderProps = {
  searchInput: string;
  onSearchInputChange: (searchInput: string) => void;
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SearchPageHeader = ({
  searchInput,
  onSearchInputChange,
  selectedObjectNameSingular,
  onSelectObject,
}: SearchPageHeaderProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleInputFocus = () => {
    pushFocusItemToFocusStack({
      focusId: SEARCH_PAGE_FOCUS_ID,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: SEARCH_PAGE_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleInputBlur = () => {
    removeFocusItemFromFocusStackById({ focusId: SEARCH_PAGE_FOCUS_ID });
  };

  return (
    <StyledHeader>
      {!isNavigationDrawerExpanded && !isMobile && (
        <NavigationDrawerCollapseButton direction="right" />
      )}
      <StyledSearchIcon>
        <IconSearch size={theme.icon.size.md} />
      </StyledSearchIcon>
      <StyledInput
        autoFocus
        data-testid={SEARCH_PAGE_FOCUS_ID}
        aria-label={t`Search`}
        value={searchInput}
        placeholder={t`Type anything...`}
        onChange={(event) => onSearchInputChange(event.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      {/* The filter list is a desktop column, so mobile keeps the dropdown */}
      {isMobile ? (
        <SidePanelObjectFilterDropdown
          selectedObjectNameSingular={selectedObjectNameSingular}
          onSelectObject={onSelectObject}
          withHiddenObjectsToggle={false}
        />
      ) : (
        <SearchPageCollapseButton />
      )}
    </StyledHeader>
  );
};
