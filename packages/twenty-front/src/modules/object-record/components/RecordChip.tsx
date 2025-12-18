import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { t } from '@lingui/core/macro';
import { type MouseEvent } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  AvatarChip,
  Chip,
  type ChipSize,
  ChipVariant,
  LinkChip,
} from 'twenty-ui/components';
import { type TriggerEventType } from 'twenty-ui/utilities';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  className?: string;
  variant?: ChipVariant.Highlighted | ChipVariant.Transparent;
  forceDisableClick?: boolean;
  maxWidth?: number;
  to?: string | undefined;
  size?: ChipSize;
  isLabelHidden?: boolean;
  isIconHidden?: boolean;
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
  isIconHidden = false,
  triggerEvent = 'MOUSE_DOWN',
  onClick,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);
  const canOpenInSidePanel = canOpenObjectInSidePanel(objectNameSingular);

  const isSidePanelViewOpenRecordInType =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL &&
    canOpenInSidePanel;

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
      <Chip
        label={recordChipData.name}
        emptyLabel={t`Untitled`}
        size={size}
        maxWidth={maxWidth}
        className={className}
        variant={ChipVariant.Transparent}
        leftComponent={
          isIconHidden ? null : (
            <AvatarChip
              placeholder={recordChipData.name}
              placeholderColorSeed={record.id}
              avatarType={recordChipData.avatarType}
              avatarUrl={recordChipData.avatarUrl ?? ''}
            />
          )
        }
      />
    );
  }

  return (
    <LinkChip
      size={size}
      maxWidth={maxWidth}
      label={recordChipData.name}
      emptyLabel={t`Untitled`}
      isLabelHidden={isLabelHidden}
      leftComponent={
        isIconHidden ? null : (
          <AvatarChip
            placeholder={recordChipData.name}
            placeholderColorSeed={record.id}
            avatarType={recordChipData.avatarType}
            avatarUrl={recordChipData.avatarUrl ?? ''}
          />
        )
      }
      className={className}
      variant={
        variant ??
        (!forceDisableClick ? ChipVariant.Highlighted : ChipVariant.Transparent)
      }
      to={to ?? getLinkToShowPage(objectNameSingular, record)}
      onClick={handleCustomClick}
      triggerEvent={triggerEvent}
    />
  );
};
