import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarChip, AvatarChipVariant, ChipSize } from 'twenty-ui';

export type RecordIdentifierChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  variant?: AvatarChipVariant;
  size?: ChipSize;
  to?: string;
  maxWidth?: number;
};

export const RecordIdentifierChip = ({
  objectNameSingular,
  record,
  variant,
  size,
  to,
  maxWidth,
}: RecordIdentifierChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { Icon: LeftIcon, IconColor: LeftIconColor } =
    useGetStandardObjectIcon(objectNameSingular);

  if (!isNonEmptyString(recordChipData.name.trim())) {
    return null;
  }

  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      to={to}
      variant={variant}
      LeftIcon={LeftIcon}
      LeftIconColor={LeftIconColor}
      size={size}
      maxWidth={maxWidth}
    />
  );
};
