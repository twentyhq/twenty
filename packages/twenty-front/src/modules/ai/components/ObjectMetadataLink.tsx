import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme-constants';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

const PROPOSED_OBJECT_METADATA_ICON = 'IconListNumbers';

type ObjectMetadataLinkProps = {
  objectNameSingular: string;
  displayName: string;
};

export const ObjectMetadataLink = ({
  objectNameSingular,
  displayName,
}: ObjectMetadataLinkProps) => {
  const theme = useTheme();
  const { navigateFromChat } = useChatTargetNavigation();

  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  const handleNavigateFromChat = isDefined(objectMetadataItem)
    ? () => {
        navigateFromChat(AppPath.RecordIndexPage, {
          objectNamePlural: objectMetadataItem.namePlural,
        });
      }
    : undefined;

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={
        isDefined(objectMetadataItem)
          ? getAppPath(AppPath.RecordIndexPage, {
              objectNamePlural: objectMetadataItem.namePlural,
            })
          : undefined
      }
      // Object pages have no side panel surface: leaving the chat page hands
      // the conversation to the side panel before navigating.
      onClick={isCurrentPathAiChatPage() ? handleNavigateFromChat : undefined}
      leftComponent={
        <ObjectMetadataIcon
          objectMetadataItem={
            objectMetadataItem ?? {
              icon: PROPOSED_OBJECT_METADATA_ICON,
              nameSingular: objectNameSingular,
              color: null,
              isSystem: false,
            }
          }
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      }
    />
  );
};
