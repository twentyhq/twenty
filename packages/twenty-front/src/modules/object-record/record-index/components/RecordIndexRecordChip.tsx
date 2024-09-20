import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
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
  const { onIndexIdentifierClick } = useContext(RecordIndexRootPropsContext);

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
