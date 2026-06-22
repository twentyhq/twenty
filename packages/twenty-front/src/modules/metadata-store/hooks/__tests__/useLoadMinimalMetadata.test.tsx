import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { resetMetadataStore } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const VIEW_FIELDS_HASH = 'hash-view-fields';
const COMMAND_MENU_ITEMS_HASH = 'hash-command-menu';

const mocks = [
  {
    request: { query: FIND_MINIMAL_METADATA },
    result: {
      data: {
        minimalMetadata: {
          objectMetadataItems: [],
          views: [],
          collectionHashes: [
            { collectionName: 'viewField', hash: VIEW_FIELDS_HASH },
            {
              collectionName: 'commandMenuItem',
              hash: COMMAND_MENU_ITEMS_HASH,
            },
          ],
        },
      },
    },
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  </JotaiProvider>
);

describe('useLoadMinimalMetadata', () => {
  beforeEach(() => {
    resetMetadataStore(jotaiStore);
  });

  // Regression: boot readiness is gated on each entity's `status`, but the
  // refetch decision is gated on `currentCollectionHash`. A snapshot persisted
  // mid-draft (status 'draft-pending') whose hash still matches the server would
  // otherwise be considered fresh, never refetched, never promoted — leaving the
  // loader hanging until the user clears storage.
  it('should flag a non-up-to-date entity as stale even when its collection hash matches the server', async () => {
    jotaiStore.set(metadataStoreState.atomFamily('viewFields'), {
      current: [{ id: 'view-field-1' }],
      draft: [{ id: 'view-field-1' }],
      status: 'draft-pending',
      currentCollectionHash: VIEW_FIELDS_HASH,
    });

    // Control: a matching hash with an 'up-to-date' status must stay fresh.
    jotaiStore.set(metadataStoreState.atomFamily('commandMenuItems'), {
      current: [{ id: 'command-menu-item-1' }],
      draft: [],
      status: 'up-to-date',
      currentCollectionHash: COMMAND_MENU_ITEMS_HASH,
    });

    const { result } = renderHook(() => useLoadMinimalMetadata(), {
      wrapper: Wrapper,
    });

    const loadResult = await result.current.loadMinimalMetadata();

    expect(loadResult?.staleEntityKeys).toContain('viewFields');
    expect(loadResult?.staleEntityKeys).not.toContain('commandMenuItems');
  });
});
