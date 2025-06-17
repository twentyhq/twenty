import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { MouseEvent } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  AvatarChip,
  AvatarChipVariant,
  ChipSize,
  ChipVariant,
  LinkAvatarChip,
} from 'twenty-ui/components';
import { TriggerEventType } from 'twenty-ui/utilities';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  className?: string;
  variant?: AvatarChipVariant;
  forceDisableClick?: boolean;
  maxWidth?: number;
  to?: string | undefined;
  size?: ChipSize;
  isLabelHidden?: boolean;
  triggerEvent?: TriggerEventType;
  onClick?: (event: MouseEvent) => void;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  className,
  variant,
  maxWidth,
  to,
  size,
  forceDisableClick = false,
  isLabelHidden = false,
  triggerEvent = 'MOUSE_DOWN',
  onClick,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const isSidePanelViewOpenRecordInType =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL;

  const handleCustomClick = isDefined(onClick)
    ? onClick
    : isSidePanelViewOpenRecordInType
      ? (_event: MouseEvent<HTMLElement>) => {
          openRecordInCommandMenu({
            recordId: record.id,
            objectNameSingular,
          });
        }
      : undefined;

  // TODO temporary until we create a record show page for Workspaces members

  if (
    forceDisableClick ||
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember
  ) {
    return (
      <AvatarChip
        size={size}
        maxWidth={maxWidth}
        placeholderColorSeed={record.id}
        name={recordChipData.name}
        avatarType={recordChipData.avatarType}
        avatarUrl={recordChipData.avatarUrl ?? ''}
        className={className}
        variant={ChipVariant.Transparent}
      />
    );
  }

  return (
    <LinkAvatarChip
      size={size}
      maxWidth={maxWidth}
      placeholderColorSeed={record.id}
      name={recordChipData.name}
      isLabelHidden={isLabelHidden}
      avatarType={recordChipData.avatarType}
      avatarUrl={recordChipData.avatarUrl ?? ''}
      className={className}
      variant={
        variant ??
        (!forceDisableClick
          ? AvatarChipVariant.Regular
          : AvatarChipVariant.Transparent)
      }
      to={to ?? getLinkToShowPage(objectNameSingular, record)}
      onClick={handleCustomClick}
      triggerEvent={triggerEvent}
    />
  );
};
