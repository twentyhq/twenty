import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

type RecordBoardScopeInternalContextProps = ComponentStateKey & {
  onFieldsChange: (fields: FieldDefinition<FieldMetadata>[]) => void;
  onColumnsChange: (column: RecordBoardColumnDefinition[]) => void;
};

export const RecordBoardScopeInternalContext =
  createScopeInternalContext<RecordBoardScopeInternalContextProps>();
