import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { type TriggerEventType } from '@/ui/navigation/types/TriggerEventType';
import { type MouseEvent } from 'react';
import { CoreObjectNameSingular, OpenRecordIn } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getIconTileColorShades } from 'twenty-ui/components/data-display';
import { useIcons } from 'twenty-ui/icon';
import { Chip, type ChipSize } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
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
  tooltipContent?: string;
};

export const RecordChip = ({
  objectNameSingular,
  record,
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
  tooltipContent: customTooltipContent,
}: RecordChipProps) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular,
    record,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { getIcon } = useIcons();

  const imageIdentifierFieldMetadataItem =
    getImageIdentifierFieldMetadataItem(objectMetadataItem);

  const hasImageIdentifier = isDefined(imageIdentifierFieldMetadataItem);

  const shouldDisplayObjectIcon =
    !hasImageIdentifier && isDefined(objectMetadataItem?.icon);

  const Icon = shouldDisplayObjectIcon
    ? getIcon(objectMetadataItem.icon)
    : undefined;

  const iconColor = shouldDisplayObjectIcon
    ? getIconTileColorShades(getObjectColorWithFallback(objectMetadataItem))
        .iconColor
    : undefined;

  const tooltipContent =
    customTooltipContent ?? objectMetadataItem.labelSingular;

  const { text: label, content } = getChipLabel(recordChipData.name);

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
        weight={isBold ? 'medium' : 'regular'}
        size={size}
        maxWidth={maxWidth}
        variant="plain"
        tooltipContent={tooltipContent}
        alwaysShowTooltip={isDefined(tooltipContent)}
        startElement={
          isIconHidden ? null : (
            <AvatarOrIcon
              name={recordChipData.name}
              colorSeed={record.id}
              shape={recordChipData.avatarShape}
              src={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
              Icon={Icon}
              IconColor={iconColor}
            />
          )
        }
      >
        {isLabelHidden ? undefined : content}
      </Chip>
    );
  }

  return (
    <LinkChip
      size={size}
      maxWidth={maxWidth}
      weight={isBold ? 'medium' : 'regular'}
      aria-label={isLabelHidden ? label : undefined}
      tooltipContent={tooltipContent}
      alwaysShowTooltip={isDefined(tooltipContent)}
      startElement={
        isIconHidden ? null : (
          <AvatarOrIcon
            name={recordChipData.name}
            colorSeed={record.id}
            shape={recordChipData.avatarShape}
            src={getAbsoluteImageUrl(recordChipData.avatarUrl ?? '')}
            Icon={Icon}
            IconColor={iconColor}
          />
        )
      }
      variant={variant === 'ghost' ? 'plain' : (variant ?? 'soft')}
      clickable={variant !== 'ghost'}
      to={to ?? getLinkToShowPage(objectNameSingular, record)}
      onClick={handleCustomClick}
      triggerEvent={triggerEvent}
    >
      {isLabelHidden ? undefined : content}
    </LinkChip>
  );
};
