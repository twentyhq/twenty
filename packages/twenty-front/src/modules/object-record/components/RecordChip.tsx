import { AvatarChip, AvatarChipVariant, LinkAvatarChip } from 'twenty-ui';

import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { MouseEvent } from 'react';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  className?: string;
  variant?: AvatarChipVariant;
  navigateToShowPageOnClick?: boolean;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  className,
  variant,
  navigateToShowPageOnClick = true,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const handleClick = (e: MouseEvent<Element>) => {
    e.stopPropagation();
  };

  if (navigateToShowPageOnClick) {
    return (
      <LinkAvatarChip
        placeholderColorSeed={record.id}
        name={recordChipData.name}
        avatarType={recordChipData.avatarType}
        avatarUrl={recordChipData.avatarUrl ?? ''}
        className={className}
        variant={variant}
        onClick={handleClick}
        to={
          getLinkToShowPage(objectNameSingular, record)

        }
      />
    );
  }

  return (
    <AvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      className={className}
      variant={variant}
      onClick={handleClick}
    />
  );
};
