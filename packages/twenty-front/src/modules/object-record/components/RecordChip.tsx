import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  email?: string;
  className?: string;
  variant?: AvatarChipVariant;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  email,
  className,
  variant,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  return (
    <UndecoratedLink to={getLinkToShowPage(objectNameSingular, record)}>
      <AvatarChip
        placeholderColorSeed={record.id}
        name={recordChipData.name}
        email={email}
        avatarType={recordChipData.avatarType}
        avatarUrl={recordChipData.avatarUrl ?? ''}
        className={className}
        variant={variant}
        onClick={() => {}}
      />
    </UndecoratedLink>
  );
};
