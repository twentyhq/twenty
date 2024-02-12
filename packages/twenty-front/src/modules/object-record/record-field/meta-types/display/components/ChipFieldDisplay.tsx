import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipField } from '@/object-record/record-field/meta-types/hooks/useChipField';

export const ChipFieldDisplay = () => {
  const { objectNameSingular, record } = useChipField();

  if (!record) return null;

  return (
    <RecordChip objectNameSingular={objectNameSingular || ''} record={record} />
  );
};
