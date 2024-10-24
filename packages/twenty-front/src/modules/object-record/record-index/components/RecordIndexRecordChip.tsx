import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useContext } from 'react';
import { AvatarChip, AvatarChipVariant, ChipSize } from 'twenty-ui';

export type RecordIdentifierChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  variant?: AvatarChipVariant;
  size?: ChipSize;
};

export const RecordIdentifierChip = ({
  objectNameSingular,
  record,
  variant,
  size,
}: RecordIdentifierChipProps) => {
  const { indexIdentifierUrl } = useContext(RecordIndexRootPropsContext);
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
      to={indexIdentifierUrl(record.id)}
      variant={variant}
      LeftIcon={LeftIcon}
      LeftIconColor={LeftIconColor}
      size={size}
    />
  );
};
