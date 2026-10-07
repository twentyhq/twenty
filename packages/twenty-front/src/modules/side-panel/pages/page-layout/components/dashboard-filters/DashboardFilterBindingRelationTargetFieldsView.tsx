import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

type DashboardFilterBindingRelationTargetFieldsViewProps = {
  relationField: FieldMetadataItem;
  targetFields: FieldMetadataItem[];
  currentRelationTargetFieldMetadataId: string | null | undefined;
  onBack: () => void;
  onSelectTargetField: (targetField: FieldMetadataItem) => void;
};

// One hop only: the server caps relation filter depth at one.
export const DashboardFilterBindingRelationTargetFieldsView = ({
  relationField,
  targetFields,
  currentRelationTargetFieldMetadataId,
  onBack,
  onSelectTargetField,
}: DashboardFilterBindingRelationTargetFieldsViewProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const visibleTargetFields = filterBySearchQuery({
    items: targetFields,
    searchQuery,
    getSearchableValues: (field) => [field.label, field.name],
  });

  return (
    <StyledPageLayoutDropdownContentContainer>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {relationField.label}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search fields`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <StyledPageLayoutDropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={visibleTargetFields.map((field) => field.id)}
        >
          {visibleTargetFields.length === 0 ? (
            <ListItem disabled>{t`No fields available`}</ListItem>
          ) : (
            visibleTargetFields.map((field) => (
              <SelectableListItem
                key={field.id}
                itemId={field.id}
                onEnter={() => onSelectTargetField(field)}
              >
                <ListItem
                  focused={selectedItemId === field.id}
                  onClick={() => onSelectTargetField(field)}
                  role="option"
                  aria-selected={
                    currentRelationTargetFieldMetadataId === field.id
                  }
                  selected={currentRelationTargetFieldMetadataId === field.id}
                  indicator="check"
                  startIcon={<SelectOptionIcon Icon={getIcon(field.icon)} />}
                >
                  {field.label}
                </ListItem>
              </SelectableListItem>
            ))
          )}
        </SelectableList>
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
