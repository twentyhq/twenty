import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { ColumnDefinition } from '../../types/ColumnDefinition';

type RecordTableComponentInstanceContextProps = ComponentStateKey & {
  onColumnsChange: (columns: ColumnDefinition<FieldMetadata>[]) => void;
};

export const RecordTableComponentInstanceContext =
  createComponentInstanceContext<RecordTableComponentInstanceContextProps>();
