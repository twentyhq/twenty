import { AvatarChip, AvatarChipVariant, LinkAvatarChip } from 'twenty-ui';

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
        /*
        TODO handle this new logic from conflicts with bosi
             to={
        recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          ? getLinkToShowPage(objectNameSingular, record)
          : undefined
      }
        */
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
