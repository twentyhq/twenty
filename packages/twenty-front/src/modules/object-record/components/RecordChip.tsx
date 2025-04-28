import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
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
import { isModifiedEvent } from 'twenty-ui/utilities';

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
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

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
        variant={ChipVariant.Static}
      />
    );
  }

  const isSidePanelViewOpenRecordInType =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL;
  const onClick = isSidePanelViewOpenRecordInType
    ? () =>
        openRecordInCommandMenu({
          recordId: record.id,
          objectNameSingular,
        })
    : undefined;

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
      onClick={(clickEvent) => {
        // TODO refactor wrapper event listener to avoid colliding events
        clickEvent.stopPropagation();

        const isModifiedEventResult = isModifiedEvent(clickEvent);
        if (isSidePanelViewOpenRecordInType && !isModifiedEventResult) {
          clickEvent.preventDefault();
          onClick?.();
        }
      }}
    />
  );
};
