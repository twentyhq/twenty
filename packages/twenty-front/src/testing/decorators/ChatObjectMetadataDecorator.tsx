import { type Decorator } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { addTestChatObjectMetadataItems } from '~/testing/utils/addTestChatObjectMetadataItems';

export const ChatObjectMetadataDecorator: Decorator = (Story) => {
  const store = useStore();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const isMetadataLoaded = objectMetadataItems.length > 0;
  const hasChatObjectMetadata = objectMetadataItems.some(
    ({ nameSingular }) =>
      nameSingular === StandardObjectNameSingular.AgentChatThreadTarget,
  );

  useEffect(() => {
    if (isMetadataLoaded && !hasChatObjectMetadata) {
      addTestChatObjectMetadataItems(store);
    }
  }, [hasChatObjectMetadata, isMetadataLoaded, store]);

  return <>{hasChatObjectMetadata && <Story />}</>;
};
