import { atom, createStore } from 'jotai';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const CHAT_OBJECT_METADATA_ID = 'chat-object-metadata-id';

jest.mock('@/object-metadata/states/objectMetadataItemFamilySelector', () => ({
  objectMetadataItemFamilySelector: {
    type: 'FamilySelector',
    selectorFamily: () =>
      atom({ id: 'chat-object-metadata-id', nameSingular: 'agentChatThread' }),
  },
}));

const buildFavorite = ({
  id,
  targetRecordId,
  label,
  position,
  targetObjectMetadataId = CHAT_OBJECT_METADATA_ID,
  userWorkspaceId = 'user-workspace-id',
}: {
  id: string;
  targetRecordId: string;
  label: string;
  position: number;
  targetObjectMetadataId?: string;
  userWorkspaceId?: string | null;
}) => ({
  id,
  type: NavigationMenuItemType.RECORD,
  targetRecordId,
  targetObjectMetadataId,
  targetRecordIdentifier: { id: targetRecordId, labelIdentifier: label },
  userWorkspaceId,
  position,
});

const buildStore = (navigationMenuItems: unknown[]) => {
  const store = createStore();

  store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
    current: navigationMenuItems,
    draft: [],
    status: 'up-to-date',
  } as never);

  return store;
};

describe('agentChatFavoriteThreadsSelector', () => {
  it("lists the member's chat favorites in their order", () => {
    const store = buildStore([
      buildFavorite({
        id: 'second',
        targetRecordId: 'chat-2',
        label: 'Second',
        position: 2,
      }),
      buildFavorite({
        id: 'first',
        targetRecordId: 'chat-1',
        label: 'First',
        position: 1,
      }),
      buildFavorite({
        id: 'company',
        targetRecordId: 'company-1',
        label: 'Acme',
        position: 0,
        targetObjectMetadataId: 'company-object-metadata-id',
      }),
      buildFavorite({
        id: 'workspace-item',
        targetRecordId: 'chat-3',
        label: 'Pinned by the workspace',
        position: 0,
        userWorkspaceId: null,
      }),
    ]);

    expect(store.get(agentChatFavoriteThreadsSelector.atom)).toEqual([
      { id: 'chat-1', title: 'First', deletedAt: null },
      { id: 'chat-2', title: 'Second', deletedAt: null },
    ]);
  });

  it('follows the loaded chat and leaves out a deleted one', () => {
    const store = buildStore([
      buildFavorite({
        id: 'renamed',
        targetRecordId: 'chat-1',
        label: 'Old title',
        position: 1,
      }),
      buildFavorite({
        id: 'deleted',
        targetRecordId: 'chat-2',
        label: 'Deleted chat',
        position: 2,
      }),
    ]);

    store.set(recordStoreFamilyState.atomFamily('chat-1'), {
      __typename: 'AgentChatThread',
      id: 'chat-1',
      title: 'New title',
      deletedAt: null,
    });
    store.set(recordStoreFamilyState.atomFamily('chat-2'), {
      __typename: 'AgentChatThread',
      id: 'chat-2',
      title: 'Deleted chat',
      deletedAt: '2026-09-30T00:00:00.000Z',
    });

    expect(store.get(agentChatFavoriteThreadsSelector.atom)).toEqual([
      { id: 'chat-1', title: 'New title', deletedAt: null },
    ]);
  });
});
