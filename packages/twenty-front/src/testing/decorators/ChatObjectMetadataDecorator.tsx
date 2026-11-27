import { type Decorator } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { useEffect } from 'react';

import { LEGACY_INBOX_NAMES_BY_LEGACY_NAME } from '@/ai-chat/constants/LegacyInboxNamesByLegacyName';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { addTestChatObjectMetadataItems } from '~/testing/utils/addTestChatObjectMetadataItems';

export const ChatObjectMetadataDecorator: Decorator = (Story) => {
  const store = useStore();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const isMetadataLoaded = objectMetadataItems.length > 0;
  const hasChatObjectMetadata = objectMetadataItems.some(
    ({ nameSingular }) =>
      nameSingular === LEGACY_INBOX_NAMES_BY_LEGACY_NAME.agentChatThreadTarget,
  );

  useEffect(() => {
    if (isMetadataLoaded && !hasChatObjectMetadata) {
      addTestChatObjectMetadataItems(store);
    }
  }, [hasChatObjectMetadata, isMetadataLoaded, store]);

  return <>{hasChatObjectMetadata && <Story />}</>;
};
