import { FieldInput } from '@/object-record/record-field/components/FieldInput';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';

export const RecordFieldListCellEditModePortalContent = () => {
  return (
    <RecordInlineCellEditMode>
      <FieldInput />
    </RecordInlineCellEditMode>
  );
};
