import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { canOpenObjectInSidePanel } from '@/object-record/utils/canOpenObjectInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  AvatarOrIcon,
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
  isBold?: boolean;
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
  isBold = false,
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

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const recordIndexOpenRecordIn = useAtomStateValue(
    recordIndexOpenRecordInState,
  );
  const canOpenInSidePanel = canOpenObjectInSidePanel(objectNameSingular);

  const isSidePanelViewOpenRecordIn =
    recordIndexOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL &&
    canOpenInSidePanel;

  const handleCustomClick = isDefined(onClick)
    ? onClick
    : isSidePanelViewOpenRecordIn
      ? (_event: MouseEvent<HTMLElement>) => {
          openRecordInSidePanel({
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
        isBold={isBold}
        size={size}
        maxWidth={maxWidth}
        className={className}
        variant={ChipVariant.Transparent}
        leftComponent={
          isIconHidden ? null : (
            <AvatarOrIcon
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
      isBold={isBold}
      isLabelHidden={isLabelHidden}
      leftComponent={
        isIconHidden ? null : (
          <AvatarOrIcon
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
