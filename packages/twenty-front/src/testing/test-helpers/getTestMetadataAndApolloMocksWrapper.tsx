import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { type ReactNode } from 'react';
import { RecoilRoot, type MutableSnapshot } from 'recoil';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type InMemoryCache } from '@apollo/client';
import { TestContextStoreSetter } from '~/testing/test-helpers/TestContextStoreSetter';
import { TestObjectMetadataItemSetter } from '~/testing/test-helpers/TestObjectMetadataItemSetter';

export const getTestMetadataAndApolloMocksWrapper = ({
  apolloMocks,
  cache,
  onInitializeRecoilSnapshot,
  objectMetadataItems,
}: {
  cache?: InMemoryCache;
  apolloMocks?:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
  objectMetadataItems?: ObjectMetadataItem[];
}) => {
  return ({ children }: { children: ReactNode }) => (
    <RecoilRoot initializeState={onInitializeRecoilSnapshot}>
      <SnackBarComponentInstanceContext.Provider
        value={{ instanceId: 'snack-bar-manager' }}
      >
        <MockedProvider mocks={apolloMocks} addTypename={false} cache={cache}>
          <RecordComponentInstanceContextsWrapper componentInstanceId="instanceId">
            <ViewComponentInstanceContext.Provider
              value={{ instanceId: 'instanceId' }}
            >
              <TestObjectMetadataItemSetter
                objectMetadataItems={objectMetadataItems}
              >
                <ContextStoreComponentInstanceContext.Provider
                  value={{ instanceId: 'instanceId' }}
                >
                  <TestContextStoreSetter>{children}</TestContextStoreSetter>
                </ContextStoreComponentInstanceContext.Provider>
              </TestObjectMetadataItemSetter>
            </ViewComponentInstanceContext.Provider>
          </RecordComponentInstanceContextsWrapper>
        </MockedProvider>
      </SnackBarComponentInstanceContext.Provider>
    </RecoilRoot>
  );
};
