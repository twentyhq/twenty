import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme-constants';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

type RecordsLinkProps = {
  objectMetadataId: string;
  displayName: string;
};

export const RecordsLink = ({
  objectMetadataId,
  displayName,
}: RecordsLinkProps) => {
  const theme = useTheme();
  const { openViewTarget } = useChatTargetNavigation();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const objectMetadataItem = objectMetadataItemsByIdMap.get(objectMetadataId);

  if (!isDefined(objectMetadataItem)) {
    return <span>{displayName}</span>;
  }

  const handleOpenViewTarget = () => {
    openViewTarget({
      objectNameSingular: objectMetadataItem.nameSingular,
    });
  };

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: objectMetadataItem.namePlural,
      })}
      onClick={isCurrentPathAiChatPage() ? handleOpenViewTarget : undefined}
      leftComponent={
        <ObjectMetadataIcon
          objectMetadataItem={objectMetadataItem}
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      }
    />
  );
};
