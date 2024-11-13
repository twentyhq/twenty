import {
  SingleEntitySelectMenuItems,
  SingleEntitySelectMenuItemsProps,
} from '@/object-record/relation-picker/components/SingleEntitySelectMenuItems';
import { useEntitySelectSearch } from '@/object-record/relation-picker/hooks/useEntitySelectSearch';
import { useRelationPickerEntitiesOptions } from '@/object-record/relation-picker/hooks/useRelationPickerEntitiesOptions';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { Placement } from '@floating-ui/react';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export type SingleEntitySelectMenuItemsWithSearchProps = {
  excludedRelationRecordIds?: string[];
  onCreate?: ((searchInput?: string) => void) | (() => void);
  relationObjectNameSingular: string;
  relationPickerScopeId?: string;
  selectedRelationRecordIds: string[];
  dropdownPlacement?: Placement | null;
} & Pick<
  SingleEntitySelectMenuItemsProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'onCancel'
  | 'onEntitySelected'
  | 'selectedEntity'
>;

export const SingleEntitySelectMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  excludedRelationRecordIds,
  onCancel,
  onCreate,
  onEntitySelected,
  relationObjectNameSingular,
  relationPickerScopeId = 'relation-picker',
  selectedRelationRecordIds,
  dropdownPlacement,
}: SingleEntitySelectMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useEntitySelectSearch({
    relationPickerScopeId,
  });

  const { entities, relationPickerSearchFilter } =
    useRelationPickerEntitiesOptions({
      relationObjectNameSingular,
      selectedRelationRecordIds,
      excludedRelationRecordIds,
    });

  const showCreateButton = isDefined(onCreate);

  let onCreateWithInput = undefined;

  if (isDefined(onCreate)) {
    onCreateWithInput = () => {
      if (onCreate.length > 0) {
        (onCreate as (searchInput?: string) => void)(
          relationPickerSearchFilter,
        );
      } else {
        (onCreate as () => void)();
      }
    };
  }

  const results = (
    <SingleEntitySelectMenuItems
      entitiesToSelect={entities.entitiesToSelect}
      loading={entities.loading}
      selectedEntity={
        entities.selectedEntities.length === 1
          ? entities.selectedEntities[0]
          : undefined
      }
      shouldSelectEmptyOption={selectedRelationRecordIds?.length === 0}
      hotkeyScope={relationPickerScopeId}
      onCreate={onCreateWithInput}
      isFiltered={!!relationPickerSearchFilter}
      {...{
        EmptyIcon,
        emptyLabel,
        onCancel,
        onEntitySelected,
        showCreateButton,
      }}
    />
  );

  return (
    <>
      {dropdownPlacement?.includes('end') && (
        <>
          {results}
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuSearchInput onChange={handleSearchFilterChange} autoFocus />
      {(dropdownPlacement?.includes('start') ||
        isUndefinedOrNull(dropdownPlacement)) && (
        <>
          <DropdownMenuSeparator />
          {results}
        </>
      )}
    </>
  );
};
