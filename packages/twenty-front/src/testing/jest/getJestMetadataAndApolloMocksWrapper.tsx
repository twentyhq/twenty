import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { InMemoryCache } from '@apollo/client';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';

export const getJestMetadataAndApolloMocksWrapper = ({
  apolloMocks,
  cache,
  onInitializeRecoilSnapshot,
}: {
  cache?: InMemoryCache;
  apolloMocks?:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
}) => {
  return ({ children }: { children: ReactNode }) => (
    <RecoilRoot initializeState={onInitializeRecoilSnapshot}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <MockedProvider mocks={apolloMocks} addTypename={false} cache={cache}>
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId: 'instanceId' }}
          >
            <ViewComponentInstanceContext.Provider
              value={{ instanceId: 'instanceId' }}
            >
              <JestObjectMetadataItemSetter>
                {children}
              </JestObjectMetadataItemSetter>
            </ViewComponentInstanceContext.Provider>
          </RecordFiltersComponentInstanceContext.Provider>
        </MockedProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  );
};
