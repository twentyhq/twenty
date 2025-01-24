import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { RecordFilter } from '../../record-filter/types/RecordFilter';

export const onFilterSelectComponentState = createComponentStateV2<
  ((filter: RecordFilter | null) => void) | undefined
>({
  key: 'onFilterSelectComponentState',
  defaultValue: undefined,
  componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
});
