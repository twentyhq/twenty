import { AvatarChip, AvatarChipVariant, LinkAvatarChip } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInSelector } from '@/object-record/record-index/states/selectors/recordIndexOpenRecordInSelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  className?: string;
  variant?: AvatarChipVariant;
  forceNoopOnClick?: boolean;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  className,
  variant,
  forceNoopOnClick = false,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { openRecordInCommandMenu } = useCommandMenu();

  const recordIndexOpenRecordIn = useRecoilValue(
    recordIndexOpenRecordInSelector,
  );

  if (
    forceNoopOnClick ||
    recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
  ) {
    return (
      <AvatarChip
        placeholderColorSeed={record.id}
        name={recordChipData.name}
        avatarType={recordChipData.avatarType}
        avatarUrl={recordChipData.avatarUrl ?? ''}
        className={className}
        variant={variant}
      />
    );
  }

  const onClick =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
      ? () =>
          openRecordInCommandMenu({
            recordId: record.id,
            objectNameSingular,
          })
      : undefined;

  return (
    <LinkAvatarChip
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      className={className}
      variant={variant}
      to={getLinkToShowPage(objectNameSingular, record)}
      onClick={onClick}
    />
  );
};
