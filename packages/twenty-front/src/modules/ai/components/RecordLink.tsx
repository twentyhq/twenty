import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
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

  const { openRecordTarget } = useChatTargetNavigation();

  if (!objectMetadataItem || !isNonEmptyString(recordId)) {
    return <span>{displayName}</span>;
  }

  const handleOpenRecordTarget = () => {
    openRecordTarget({
      recordId,
      objectNameSingular,
    });
  };

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={getLinkToShowPage(objectNameSingular, { id: recordId })}
      onClick={isCurrentPathAiChatPage() ? handleOpenRecordTarget : undefined}
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
