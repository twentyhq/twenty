import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';
import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

type RecordBoardScopeInternalContextProps = RecoilComponentStateKey & {
  onFieldsChange: (fields: FieldDefinition<FieldMetadata>[]) => void;
  onColumnsChange: (column: RecordGroupDefinition[]) => void;
};

export const RecordBoardScopeInternalContext =
  createScopeInternalContext<RecordBoardScopeInternalContextProps>();
