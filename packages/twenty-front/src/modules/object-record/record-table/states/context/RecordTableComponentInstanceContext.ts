import { type FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { type ColumnDefinition } from '../../types/ColumnDefinition';

type RecordTableComponentInstanceContextProps = ComponentStateKey & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableComponentInstanceContext =
  createComponentInstanceContext<RecordTableComponentInstanceContextProps>();
