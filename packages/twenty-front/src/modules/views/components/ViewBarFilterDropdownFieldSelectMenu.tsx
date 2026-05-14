import { styled } from '@linaria/react';
import React from 'react';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { useFilterDropdownSelectableFieldMetadataItems } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownSelectableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
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
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 0;
  border-top: none;
  border-top-left-radius: ${themeCssVariables.border.radius.md};
  border-top-right-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: inherit;
  margin: 0;
  max-width: 100%;
  min-height: 19px;

  outline: none;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
  text-decoration: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

export const ViewBarFilterDropdownFieldSelectMenu = () => {
  const [objectFilterDropdownSearchInput, setObjectFilterDropdownSearchInput] =
    useAtomComponentState(objectFilterDropdownSearchInputComponentState);

  const {
    selectableStandardFieldMetadataItems,
    selectableCustomFieldMetadataItems,
  } = useFilterDropdownSelectableFieldMetadataItems();

  const { closeDropdown } = useCloseDropdown();

  const selectableFieldMetadataItemIds = [
    ...selectableStandardFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
    ...selectableCustomFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.SEARCH,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.ADVANCED_FILTER,
  ];

  const shouldShowSeparator =
    selectableStandardFieldMetadataItems.length > 0 &&
    selectableCustomFieldMetadataItems.length > 0;

  const hasSelectableItems =
    selectableStandardFieldMetadataItems.length > 0 ||
    selectableCustomFieldMetadataItems.length > 0;

  const shouldShowStandardFields =
    selectableStandardFieldMetadataItems.length > 0;
  const shouldShowCustomFields = selectableCustomFieldMetadataItems.length > 0;

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
          {shouldShowStandardFields && (
            <>
              <DropdownMenuSectionLabel label={t`Standard fields`} />
              <DropdownMenuItemsContainer scrollable={false}>
                {selectableStandardFieldMetadataItems.map(
                  (standardFieldMetadataItem) => (
                    <ViewBarFilterDropdownFieldSelectMenuItem
                      key={standardFieldMetadataItem.id}
                      fieldMetadataItemToSelect={standardFieldMetadataItem}
                    />
                  ),
                )}
              </DropdownMenuItemsContainer>
            </>
          )}
          {shouldShowSeparator && <DropdownMenuSeparator />}
          {shouldShowCustomFields && (
            <>
              <DropdownMenuSectionLabel label={t`Custom fields`} />
              <DropdownMenuItemsContainer scrollable={false}>
                {selectableCustomFieldMetadataItems.map(
                  (customFieldMetadataItem) => (
                    <ViewBarFilterDropdownFieldSelectMenuItem
                      key={customFieldMetadataItem.id}
                      fieldMetadataItemToSelect={customFieldMetadataItem}
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
