import styled from '@emotion/styled';
import React from 'react';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { useFilterDropdownSelectableFieldMetadataItems } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownSelectableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { ViewBarFilterDropdownBottomMenu } from '@/views/components/ViewBarFilterDropdownBottomMenu';
import { ViewBarFilterDropdownFieldSelectMenuItem } from '@/views/components/ViewBarFilterDropdownFieldSelectMenuItem';

import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { useLingui } from '@lingui/react/macro';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-top: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  min-height: 19px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export const ViewBarFilterDropdownFieldSelectMenu = () => {
  const [objectFilterDropdownSearchInput, setObjectFilterDropdownSearchInput] =
    useRecoilComponentStateV2(objectFilterDropdownSearchInputComponentState);

  const {
    selectableHiddenFieldMetadataItems,
    selectableVisibleFieldMetadataItems,
  } = useFilterDropdownSelectableFieldMetadataItems();

  const selectableFieldMetadataItemIds = [
    ...selectableVisibleFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
    ...selectableHiddenFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.ADVANCED_FILTER,
  ];

  const shouldShowSeparator =
    selectableVisibleFieldMetadataItems.length > 0 &&
    selectableHiddenFieldMetadataItems.length > 0;

  const hasSelectableItems =
    selectableVisibleFieldMetadataItems.length > 0 ||
    selectableHiddenFieldMetadataItems.length > 0;

  const shouldShowVisibleFields =
    selectableVisibleFieldMetadataItems.length > 0;
  const shouldShowHiddenFields = selectableHiddenFieldMetadataItems.length > 0;

  const { t } = useLingui();

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <StyledInput
        value={objectFilterDropdownSearchInput}
        autoFocus
        placeholder={t`Search fields`}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setObjectFilterDropdownSearchInput(event.target.value)
        }
      />
      <SelectableList
        selectableItemIdArray={selectableFieldMetadataItemIds}
        selectableListInstanceId={FILTER_FIELD_LIST_ID}
        focusId={VIEW_BAR_FILTER_DROPDOWN_ID}
        hotkeyScope={DropdownHotkeyScope.Dropdown}
      >
        {shouldShowVisibleFields && (
          <>
            <DropdownMenuSectionLabel label={t`Visible fields`} />
            <DropdownMenuItemsContainer>
              {selectableVisibleFieldMetadataItems.map(
                (visibleFieldMetadataItem) => (
                  <ViewBarFilterDropdownFieldSelectMenuItem
                    key={visibleFieldMetadataItem.id}
                    fieldMetadataItemToSelect={visibleFieldMetadataItem}
                  />
                ),
              )}
            </DropdownMenuItemsContainer>
          </>
        )}
        {shouldShowSeparator && <DropdownMenuSeparator />}
        {shouldShowHiddenFields && (
          <>
            <DropdownMenuSectionLabel label={t`Hidden fields`} />
            <DropdownMenuItemsContainer>
              {selectableHiddenFieldMetadataItems.map(
                (hiddenFieldMetadataItem) => (
                  <ViewBarFilterDropdownFieldSelectMenuItem
                    key={hiddenFieldMetadataItem.id}
                    fieldMetadataItemToSelect={hiddenFieldMetadataItem}
                  />
                ),
              )}
            </DropdownMenuItemsContainer>
          </>
        )}
        {hasSelectableItems && <DropdownMenuSeparator />}
        <ViewBarFilterDropdownBottomMenu />
      </SelectableList>
    </DropdownContent>
  );
};
