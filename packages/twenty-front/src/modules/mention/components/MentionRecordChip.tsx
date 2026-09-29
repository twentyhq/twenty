import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Chip } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type MentionRecordChipProps = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl: string;
  className?: string;
};

export const MentionRecordChip = ({
  recordId,
  objectNameSingular,
  label,
  imageUrl,
  className,
}: MentionRecordChipProps) => {
  if (!isNonEmptyString(objectNameSingular)) {
    return (
      <Chip
        variant="ghost"
        disabled
        style={{ paddingInlineStart: 0 }}
      >{t`Unknown object`}</Chip>
    );
  }

  if (!isNonEmptyString(recordId)) {
    return (
      <Chip
        variant="ghost"
        disabled
        style={{ paddingInlineStart: 0 }}
      >{t`Deleted record`}</Chip>
    );
  }

  const linkToShowPage = getLinkToShowPage(objectNameSingular, {
    id: recordId,
  });

  return (
    <LinkChip
      emptyLabel={t`Untitled`}
      to={linkToShowPage}
      variant="soft"
      className={className}
      startElement={
        <AvatarOrIcon
          name={label}
          colorSeed={recordId}
          shape="circle"
          src={getAbsoluteImageUrl(imageUrl)}
        />
      }
    >
      {label}
    </LinkChip>
  );
};
