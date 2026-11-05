import { createStore } from 'jotai';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectMetadataItemByUniversalIdentifierFamilySelector } from '@/object-metadata/states/objectMetadataItemByUniversalIdentifierFamilySelector';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('objectMetadataItemByUniversalIdentifierFamilySelector', () => {
  const chatObjectMetadataItem = {
    ...getMockObjectMetadataItemOrThrow('person'),
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    nameSingular: 'agentChatThread',
    namePlural: 'agentChatThreads',
  };

  it('follows an object rename without changing its identity', () => {
    const store = createStore();
    const selector =
      objectMetadataItemByUniversalIdentifierFamilySelector.selectorFamily(
        STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      );

    store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      current: [chatObjectMetadataItem],
      draft: [],
      status: 'up-to-date',
    });
    expect(store.get(selector)?.nameSingular).toBe('agentChatThread');

    store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      current: [
        {
          ...chatObjectMetadataItem,
          nameSingular: 'inboxThread',
          namePlural: 'inboxThreads',
        },
      ],
      draft: [],
      status: 'up-to-date',
    });

    expect(store.get(selector)).toMatchObject({
      id: chatObjectMetadataItem.id,
      nameSingular: 'inboxThread',
      universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    });
  });

  it('does not select a different object with the previous name', () => {
    const store = createStore();

    store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      current: [
        {
          ...chatObjectMetadataItem,
          universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        },
      ],
      draft: [],
      status: 'up-to-date',
    });

    expect(
      store.get(
        objectMetadataItemByUniversalIdentifierFamilySelector.selectorFamily(
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        ),
      ),
    ).toBeNull();
  });
});
