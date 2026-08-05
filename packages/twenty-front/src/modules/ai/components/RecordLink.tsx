import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarOrIcon } from 'twenty-ui/data-display';

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
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  if (!objectMetadataItem || !isNonEmptyString(recordId)) {
    return <span>{displayName}</span>;
  }

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={getLinkToShowPage(objectNameSingular, { id: recordId })}
      leftComponent={
        <AvatarOrIcon
          placeholder={displayName}
          placeholderColorSeed={recordId}
          avatarType="rounded"
          avatarUrl=""
        />
      }
    />
  );
};
