import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type InMemoryCache } from '@apollo/client';
import type { Store } from 'jotai/vanilla/store';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';

export const getJestMetadataAndApolloMocksWrapper = ({
  apolloMocks,
  cache,
  onInitializeJotaiStore,
  objectMetadataItems,
}: {
  cache?: InMemoryCache;
  apolloMocks?:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeJotaiStore?: (store: Store) => void;
  objectMetadataItems?: ObjectMetadataItem[];
}) => {
  const store = resetJotaiStore();

  onInitializeJotaiStore?.(store);

  return ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <SnackBarComponentInstanceContext.Provider
        value={{ instanceId: 'snack-bar-manager' }}
      >
        <MockedProvider mocks={apolloMocks} addTypename={false} cache={cache}>
          <RecordComponentInstanceContextsWrapper componentInstanceId="instanceId">
            <ViewComponentInstanceContext.Provider
              value={{ instanceId: 'instanceId' }}
            >
              <JestObjectMetadataItemSetter
                objectMetadataItems={objectMetadataItems}
              >
                <ContextStoreComponentInstanceContext.Provider
                  value={{ instanceId: 'instanceId' }}
                >
                  <JestContextStoreSetter>{children}</JestContextStoreSetter>
                </ContextStoreComponentInstanceContext.Provider>
              </JestObjectMetadataItemSetter>
            </ViewComponentInstanceContext.Provider>
          </RecordComponentInstanceContextsWrapper>
        </MockedProvider>
      </SnackBarComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};
