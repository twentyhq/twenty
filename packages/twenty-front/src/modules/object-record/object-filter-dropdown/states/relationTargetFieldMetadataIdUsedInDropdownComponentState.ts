import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Set when the in-flight filter is a one-hop relation traversal: holds the
// metadata id of the field on the related object that the filter is being
// applied to (e.g. Company.name's field id when filtering People by company
// name). Null for direct-field and composite-sub-field filters.
export const relationTargetFieldMetadataIdUsedInDropdownComponentState =
  createAtomComponentState<string | null>({
    key: 'relationTargetFieldMetadataIdUsedInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
