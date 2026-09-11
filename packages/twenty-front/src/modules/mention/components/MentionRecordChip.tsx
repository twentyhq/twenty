import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarOrIcon, Chip, LinkChip } from 'twenty-ui/data-display';

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
        clickable={false}
      >{t`Unknown object`}</Chip>
    );
  }

  if (!isNonEmptyString(recordId)) {
    return (
      <Chip
        variant="ghost"
        disabled
        style={{ paddingInlineStart: 0 }}
        clickable={false}
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
          placeholder={label}
          placeholderColorSeed={recordId}
          avatarShape="circle"
          avatarUrl={getAbsoluteImageUrl(imageUrl)}
        />
      }
    >
      {label}
    </LinkChip>
  );
};
