import { AvatarChip, AvatarChipVariant } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInSelector } from '@/object-record/record-index/states/selectors/recordIndexOpenRecordInSelector';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { MouseEvent } from 'react';
import { useRecoilValue } from 'recoil';

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

  const { openRecordInCommandMenu } = useCommandMenu();

  const recordIndexOpenRecordIn = useRecoilValue(
    recordIndexOpenRecordInSelector,
  );

  const handleClick = (e: MouseEvent<Element>) => {
    e.stopPropagation();
    if (recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL) {
      openRecordInCommandMenu({
        recordId: record.id,
        objectNameSingular,
      });
    }
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
      to={
        recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          ? getLinkToShowPage(objectNameSingular, record)
          : undefined
      }
    />
  );
};
