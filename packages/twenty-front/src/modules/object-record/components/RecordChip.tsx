import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  className?: string;
  variant?: AvatarChipVariant;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  className,
  variant,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const handleClick = (event: React.MouseEvent<Element>) => {
    event.stopPropagation();
  };

  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      className={className}
      variant={variant}
      onClick={handleClick}
      to={getLinkToShowPage(objectNameSingular, record)}
    />
  );
};
