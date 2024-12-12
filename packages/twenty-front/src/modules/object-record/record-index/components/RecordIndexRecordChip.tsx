import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { AvatarChip, AvatarChipVariant, ChipSize } from 'twenty-ui';

export type RecordIdentifierChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  variant?: AvatarChipVariant;
  size?: ChipSize;
  maxWidth?: number;
};

export const RecordIdentifierChip = ({
  objectNameSingular,
  record,
  variant,
  size,
  maxWidth,
}: RecordIdentifierChipProps) => {
  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { Icon: LeftIcon, IconColor: LeftIconColor } =
    useGetStandardObjectIcon(objectNameSingular);
  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      to={indexIdentifierUrl ? indexIdentifierUrl(record.id) : undefined}
      variant={variant}
      LeftIcon={LeftIcon}
      LeftIconColor={LeftIconColor}
      size={size}
      maxWidth={maxWidth}
    />
  );
};
