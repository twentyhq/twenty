import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarChip, Chip, ChipVariant, LinkChip } from 'twenty-ui/components';

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
        label={t`Unknown object`}
        variant={ChipVariant.Transparent}
        disabled
      />
    );
  }

  if (!isNonEmptyString(recordId)) {
    return (
      <Chip
        label={t`Deleted record`}
        variant={ChipVariant.Transparent}
        disabled
      />
    );
  }

  const linkToShowPage = getLinkToShowPage(objectNameSingular, {
    id: recordId,
  });

  return (
    <LinkChip
      label={label}
      emptyLabel={t`Untitled`}
      to={linkToShowPage}
      variant={ChipVariant.Highlighted}
      className={className}
      leftComponent={
        <AvatarChip
          placeholder={label}
          placeholderColorSeed={recordId}
          avatarType="rounded"
          avatarUrl={imageUrl}
        />
      }
    />
  );
};
