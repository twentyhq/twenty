import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

type ViewLinkProps = {
  viewId: string;
  displayName: string;
};

export const ViewLink = ({ viewId, displayName }: ViewLinkProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { navigateFromChat } = useChatTargetNavigation();

  const { view } = useViewById(viewId);
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const objectMetadataItem = isDefined(view)
    ? objectMetadataItemsByIdMap.get(view.objectMetadataId)
    : undefined;

  if (!isDefined(view) || !isDefined(objectMetadataItem)) {
    return <span>{displayName}</span>;
  }

  const Icon = getIcon(view.icon);

  const handleNavigateFromChat = () => {
    navigateFromChat(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadataItem.namePlural },
      { viewId },
    );
  };

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: objectMetadataItem.namePlural },
        { viewId },
      )}
      // Views have no side panel surface: leaving the chat page hands the
      // conversation to the side panel before navigating.
      onClick={isCurrentPathAiChatPage() ? handleNavigateFromChat : undefined}
      leftComponent={
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    />
  );
};
