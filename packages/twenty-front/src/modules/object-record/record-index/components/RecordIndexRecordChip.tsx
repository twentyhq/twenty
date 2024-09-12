import { GetAvatarIcon } from '@/object-metadata/utils/getAvatarIcon';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { RecordIndexEventContext } from '@/object-record/record-index/contexts/RecordIndexEventContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

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

  const { Icon: LeftIcon, IconColor: LeftIconColor } =
    GetAvatarIcon(objectNameSingular);
  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      onClick={handleAvatarChipClick}
      variant={variant}
      LeftIcon={LeftIcon}
      LeftIconColor={LeftIconColor}
    />
  );
};
