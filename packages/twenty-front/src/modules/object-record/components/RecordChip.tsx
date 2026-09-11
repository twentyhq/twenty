import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CoreObjectNameSingular, OpenRecordIn } from 'twenty-shared/types';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { t } from '@lingui/core/macro';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  AvatarOrIcon,
  Chip,
  type ChipSize,
  LinkChip,
} from 'twenty-ui/data-display';
import { type TriggerEventType } from 'twenty-ui/utilities';

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
              placeholder={recordChipData.name}
              placeholderColorSeed={record.id}
              avatarShape={recordChipData.avatarShape}
              avatarUrl={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
            />
          )
        }
        style={{ paddingInlineStart: 0 }}
        clickable={false}
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
            placeholder={recordChipData.name}
            placeholderColorSeed={record.id}
            avatarShape={recordChipData.avatarShape}
            avatarUrl={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
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
