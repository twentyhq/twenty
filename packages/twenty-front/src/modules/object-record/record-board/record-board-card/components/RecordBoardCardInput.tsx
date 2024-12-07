import { RecordCreateBoardCardFullNameInput } from '@/object-record/record-board/record-board-card/components/RecordCreateBoardCardFullNameInput';
import { RecordCreateBoardCardTextInput } from '@/object-record/record-board/record-board-card/components/RecordCreateBoardCardTextInput';
import { RecordBoardFieldDefinition } from '@/object-record/record-board/types/RecordBoardFieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { FieldMetadataType } from '~/generated/graphql';

type RecordBoardCardInputProps = {
  labelIdentifierField: RecordBoardFieldDefinition<FieldMetadata> | undefined;
  position: 'first' | 'last' | undefined;
  onCreateSuccess: (() => void) | undefined;
};

export const RecordBoardCardInput = ({
  labelIdentifierField,
  position,
  onCreateSuccess,
}: RecordBoardCardInputProps) => {
  if (!position || !labelIdentifierField) {
    return null;
  }

  return (
    <RecordInlineCellEditMode>
      {labelIdentifierField.type === FieldMetadataType.FullName ? (
        <RecordCreateBoardCardFullNameInput
          position={position}
          onCreateSuccess={onCreateSuccess}
          label={labelIdentifierField.label}
        />
      ) : (
        <RecordCreateBoardCardTextInput
          position={position}
          onCreateSuccess={onCreateSuccess}
          label={labelIdentifierField.label}
        />
      )}
    </RecordInlineCellEditMode>
  );
};
