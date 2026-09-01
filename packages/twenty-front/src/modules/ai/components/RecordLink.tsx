import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
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
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const recordPath =
    objectMetadataItem && isNonEmptyString(recordId)
      ? getLinkToShowPage(objectNameSingular, { id: recordId })
      : undefined;
  const path = isNonEmptyString(recordPath) ? recordPath : undefined;

  const { to, onClick } = useChatReferenceTarget(path, () => {
    openRecordInSidePanel({ recordId, objectNameSingular });
  });

  if (!objectMetadataItem || !isNonEmptyString(recordId)) {
    return <span>{displayName}</span>;
  }

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={to}
      onClick={onClick}
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
