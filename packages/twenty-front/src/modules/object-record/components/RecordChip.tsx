import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { RECORD_CHIP_CLICK_OUTSIDE_ID } from '@/object-record/constants/RecordChipClickOutsideId';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';
import {
  AvatarChip,
  AvatarChipVariant,
  ChipSize,
  ChipVariant,
  LinkAvatarChip,
} from 'twenty-ui/components';
import { TriggerEventType, useMouseDownNavigation } from 'twenty-ui/utilities';

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
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const isSidePanelViewOpenRecordInType =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL;

  const handleCustomClick = isSidePanelViewOpenRecordInType
    ? () =>
        openRecordInCommandMenu({
          recordId: record.id,
          objectNameSingular,
        })
    : undefined;

  const { onClick, onMouseDown } = useMouseDownNavigation({
    to: to ?? getLinkToShowPage(objectNameSingular, record),
    onClick: handleCustomClick,
    disabled: forceDisableClick,
    stopPropagation: true,
    triggerEvent,
  });

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
      onClick={onClick}
      onMouseDown={onMouseDown}
      data-click-outside-id={
        isSidePanelViewOpenRecordInType
          ? RECORD_CHIP_CLICK_OUTSIDE_ID
          : undefined
      }
    />
  );
};
