import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Holds either a composite sub-field (e.g. 'firstName' for FULL_NAME) or a
// target field's name when the user drilled into a MANY_TO_ONE relation. The
// type stays narrow (CompositeFieldSubFieldName) so downstream composite-only
// utilities don't have to be widened; relation target field names are cast
// at the dropdown's storage point.
export const subFieldNameUsedInDropdownComponentState =
  createAtomComponentState<CompositeFieldSubFieldName | null | undefined>({
    key: 'subFieldNameUsedInDropdownComponentState',
    defaultValue: null,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });
