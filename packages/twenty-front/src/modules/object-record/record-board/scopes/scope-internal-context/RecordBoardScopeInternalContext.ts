import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

type RecordBoardScopeInternalContextProps = ComponentStateKey & {
  onFieldsChange: (fields: FieldDefinition<FieldMetadata>[]) => void;
  onColumnsChange: (column: RecordGroupDefinition[]) => void;
};

export const RecordBoardScopeInternalContext =
  createScopeInternalContext<RecordBoardScopeInternalContextProps>();
