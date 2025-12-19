import styled from '@emotion/styled';
import React from 'react';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { useFilterDropdownSelectableFieldMetadataItems } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownSelectableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { ViewBarFilterDropdownBottomMenu } from '@/views/components/ViewBarFilterDropdownBottomMenu';
import { ViewBarFilterDropdownFieldSelectMenuItem } from '@/views/components/ViewBarFilterDropdownFieldSelectMenuItem';

import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/display';

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
    useRecoilComponentState(objectFilterDropdownSearchInputComponentState);

  const {
    selectableHiddenFieldMetadataItems,
    selectableVisibleFieldMetadataItems,
  } = useFilterDropdownSelectableFieldMetadataItems();

  const { closeDropdown } = useCloseDropdown();

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
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => closeDropdown()}
            Icon={IconX}
          />
        }
      >
        {t`Filter`}
      </DropdownMenuHeader>
      <ScrollWrapper componentInstanceId="view-bar-dropdown-filter-field-select-menu">
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
          focusId={ViewBarFilterDropdownIds.MAIN}
        >
          {shouldShowVisibleFields && (
            <>
              <DropdownMenuSectionLabel label={t`Visible fields`} />
              <DropdownMenuItemsContainer scrollable={false}>
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
              <DropdownMenuItemsContainer scrollable={false}>
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
      </ScrollWrapper>
    </DropdownContent>
  );
};
