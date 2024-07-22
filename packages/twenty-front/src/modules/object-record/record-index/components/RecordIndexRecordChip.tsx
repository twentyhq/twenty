import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { RecordIndexEventContext } from '@/object-record/record-index/contexts/RecordIndexEventContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';

export type RecordIdentifierChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  variant?: AvatarChipVariant;
};

export const RecordIdentifierChip = ({
  objectNameSingular,
  record,
  variant,
}: RecordIdentifierChipProps) => {
  const { onIndexIdentifierClick } = useContext(RecordIndexEventContext);

  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const handleAvatarChipClick = () => {
    onIndexIdentifierClick(record.id);
  };

  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      onClick={handleAvatarChipClick}
      variant={variant}
    />
  );
};
