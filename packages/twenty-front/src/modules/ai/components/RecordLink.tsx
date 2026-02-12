import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarChip, ChipVariant, LinkChip } from 'twenty-ui/components';

type RecordLinkProps = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

export const RecordLink = ({
  objectNameSingular,
  recordId,
  displayName,
}: RecordLinkProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (!objectMetadataItem || !isNonEmptyString(recordId)) {
    return <span>{displayName}</span>;
  }

  const linkToShowPage = getLinkToShowPage(objectNameSingular, {
    id: recordId,
  });

  return (
    <LinkChip
      label={displayName}
      emptyLabel={t`Untitled`}
      to={linkToShowPage}
      variant={ChipVariant.Highlighted}
      leftComponent={
        <AvatarChip
          placeholder={displayName}
          placeholderColorSeed={recordId}
          avatarType="rounded"
          avatarUrl=""
        />
      }
    />
  );
};

export const RECORD_REFERENCE_REGEX =
  /\[\[record:([a-zA-Z]+):([a-f0-9-]+):([^\]]+)\]\]/g;

export const parseRecordReference = (match: string) => {
  const regex = /\[\[record:([a-zA-Z]+):([a-f0-9-]+):([^\]]+)\]\]/;
  const result = regex.exec(match);

  if (!result) {
    return null;
  }

  return {
    objectNameSingular: result[1],
    recordId: result[2],
    displayName: result[3],
  };
};
