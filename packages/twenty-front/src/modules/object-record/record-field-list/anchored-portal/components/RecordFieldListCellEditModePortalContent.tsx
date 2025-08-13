import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';

export const RecordFieldListCellEditModePortalContent = () => {
  return (
    <RecordInlineCellEditMode>
      <FieldInput />
    </RecordInlineCellEditMode>
  );
};
