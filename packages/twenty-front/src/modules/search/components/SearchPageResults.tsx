import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Label } from 'twenty-ui/typography';

import { SearchPageDefaultSelectionEffect } from '@/search/components/SearchPageDefaultSelectionEffect';
import { SearchResultListItem } from '@/search/components/SearchResultListItem';
import { SEARCH_PAGE_FOCUS_ID } from '@/search/constants/SearchPageFocusId';
import { SEARCH_PAGE_SELECTABLE_LIST_ID } from '@/search/constants/SearchPageSelectableListId';
import { type SearchResultItem } from '@/search/types/SearchResultItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledContainer = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledHeading = styled.div`
  padding: ${themeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  height: 64px;
  justify-content: center;
`;

type SearchPageResultsProps = {
  searchResultItems: SearchResultItem[];
  selectableItemIds: string[];
  loading: boolean;
  noResults: boolean;
  onItemClick: (item: SearchResultItem) => void;
};

export const SearchPageResults = ({
  searchResultItems,
  selectableItemIds,
  loading,
  noResults,
  onItemClick,
}: SearchPageResultsProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <SearchPageDefaultSelectionEffect selectableItemIds={selectableItemIds} />
      <ScrollWrapper componentInstanceId="scroll-wrapper-search-page-results">
        <StyledList>
          <SelectableList
            selectableListInstanceId={SEARCH_PAGE_SELECTABLE_LIST_ID}
            focusId={SEARCH_PAGE_FOCUS_ID}
            selectableItemIdArray={selectableItemIds}
          >
            {searchResultItems.length > 0 && (
              <StyledHeading>
                <Label>{t`Results`}</Label>
              </StyledHeading>
            )}
            {searchResultItems.map((item) => (
              <SearchResultListItem
                key={item.id}
                item={item}
                onClick={() => onItemClick(item)}
              />
            ))}
            {noResults && !loading && (
              <StyledEmpty>{t`No results found`}</StyledEmpty>
            )}
          </SelectableList>
        </StyledList>
      </ScrollWrapper>
    </StyledContainer>
  );
};
