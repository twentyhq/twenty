import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';
import { IconFilter, Pill } from 'twenty-ui';
import { v4 } from 'uuid';

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const StyledMenuItemSelect = styled(StyledMenuItemBase)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const StyledPill = styled(Pill)`
  background: ${({ theme }) => theme.color.blueAccent10};
  color: ${({ theme }) => theme.color.blue};
`;

export const AdvancedFilterButton = () => {
  const advancedFilterQuerySubFilterCount = 0; // TODO

  const { setIsDraftingAdvancedFilter } = useFilterDropdown();

  const { openDropdown: openAdvancedFilterDropdown } = useDropdown(
    ADVANCED_FILTER_DROPDOWN_ID,
  );

  const { closeDropdown: closeObjectFilterDropdown } = useDropdown(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const { currentViewId } = useGetCurrentView();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ViewComponentInstanceContext,
    undefined, // TODO: Find out what to pass here
  );

  const unsavedToUpsertViewFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFilterGroupsComponentFamilyState,
      instanceId,
    );

  const createViewFilterGroup = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newViewFilterGroup: Omit<ViewFilterGroup, '__typename'>) => {
        const currentViewUnsavedToUpsertViewFilterGroups =
          unsavedToUpsertViewFilterGroupsCallbackState({
            viewId: currentViewId,
          });

        const unsavedToUpsertViewFilterGroups = getSnapshotValue(
          snapshot,
          currentViewUnsavedToUpsertViewFilterGroups,
        );

        const newViewFilterWithTypename: ViewFilterGroup = {
          ...newViewFilterGroup,
          __typename: 'ViewFilterGroup',
        };

        set(
          unsavedToUpsertViewFilterGroupsCallbackState({
            viewId: currentViewId,
          }),
          [...unsavedToUpsertViewFilterGroups, newViewFilterWithTypename],
        );
      },
    [unsavedToUpsertViewFilterGroupsCallbackState, currentViewId],
  );

  const handleClick = () => {
    setIsDraftingAdvancedFilter(true);

    if (!currentViewId) {
      throw new Error('Missing current view id');
    }

    createViewFilterGroup({
      id: v4(),
      viewId: currentViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
    });

    openAdvancedFilterDropdown();
    closeObjectFilterDropdown();
  };

  return (
    <StyledContainer>
      <StyledMenuItemSelect onClick={handleClick}>
        <MenuItemLeftContent LeftIcon={IconFilter} text="Advanced filter" />
        {advancedFilterQuerySubFilterCount > 0 && (
          <StyledPill label={advancedFilterQuerySubFilterCount.toString()} />
        )}
      </StyledMenuItemSelect>
    </StyledContainer>
  );
};
