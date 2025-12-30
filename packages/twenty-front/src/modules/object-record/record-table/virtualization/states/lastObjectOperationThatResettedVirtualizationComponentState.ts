import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type ObjectOperation } from '@/object-record/states/objectOperationsComponentState';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type Nullable } from 'twenty-shared/types';

export const lastObjectOperationThatResettedVirtualizationComponentState =
  createComponentState<Nullable<ObjectOperation>>({
    key: 'lastObjectOperationThatResettedVirtualizationComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
