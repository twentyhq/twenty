import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const onToggleColumnFilterComponentState = createComponentStateV2<
  ((fieldMetadataId: string) => void) | undefined
>({
  key: 'onToggleColumnFilterComponentState',
  defaultValue: undefined,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
