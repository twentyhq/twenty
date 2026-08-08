import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarOrIcon } from 'twenty-ui/data-display';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

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

  if (!objectMetadataItem || !isNonEmptyString(recordId)) {
    return <span>{displayName}</span>;
  }

  const handleOpenInSidePanel = () => {
    openRecordInSidePanel({
      recordId,
      objectNameSingular,
    });
  };

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={getLinkToShowPage(objectNameSingular, { id: recordId })}
      // On the chat page the conversation keeps the main pane: records the
      // chat references open in the side panel, like the agent's navigation.
      onClick={isCurrentPathAiChatPage() ? handleOpenInSidePanel : undefined}
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
