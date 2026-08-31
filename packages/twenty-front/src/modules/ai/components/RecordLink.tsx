import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
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
  const { objectMetadataItem, to, onClick } = useChatReferenceTarget({
    kind: 'record',
    objectNameSingular,
    recordId,
  });

  if (!objectMetadataItem) {
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
