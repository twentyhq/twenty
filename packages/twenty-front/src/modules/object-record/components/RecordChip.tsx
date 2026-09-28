import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { type TriggerEventType } from '@/ui/navigation/utils/types/TriggerEventType';
import { t } from '@lingui/core/macro';
import { type MouseEvent } from 'react';
import { CoreObjectNameSingular, OpenRecordIn } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Chip, type ChipSize } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  className?: string;
  variant?: 'soft' | 'ghost';
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

  const openRecordIn = useResolveOpenRecordIn(objectNameSingular);

  const handleCustomClick = isDefined(onClick)
    ? onClick
    : openRecordIn === OpenRecordIn.SIDE_PANEL
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
        emptyLabel={t`Untitled`}
        weight={isBold ? 'medium' : 'regular'}
        size={size}
        maxWidth={maxWidth}
        className={className}
        variant="ghost"
        startElement={
          isIconHidden ? null : (
            <AvatarOrIcon
              name={recordChipData.name}
              colorSeed={record.id}
              shape={recordChipData.avatarShape}
              src={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
            />
          )
        }
        style={{ paddingInlineStart: 0 }}
      >
        {recordChipData.name}
      </Chip>
    );
  }

  return (
    <LinkChip
      size={size}
      maxWidth={maxWidth}
      emptyLabel={t`Untitled`}
      weight={isBold ? 'medium' : 'regular'}
      isLabelHidden={isLabelHidden}
      startElement={
        isIconHidden ? null : (
          <AvatarOrIcon
            name={recordChipData.name}
            colorSeed={record.id}
            shape={recordChipData.avatarShape}
            src={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
          />
        )
      }
      className={className}
      variant={variant ?? 'soft'}
      clickable={variant !== 'ghost'}
      style={variant === 'ghost' ? { paddingInlineStart: 0 } : undefined}
      to={to ?? getLinkToShowPage(objectNameSingular, record)}
      onClick={handleCustomClick}
      triggerEvent={triggerEvent}
    >
      {recordChipData.name}
    </LinkChip>
  );
};
