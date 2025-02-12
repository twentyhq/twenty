import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { InMemoryCache } from '@apollo/client';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

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
          <RecordIndexContextProvider
            value={{
              indexIdentifierUrl: () => 'indexIdentifierUrl',
              onIndexRecordsLoaded: () => {},
              objectNamePlural: 'objectNamePlural',
              objectNameSingular: 'objectNameSingular',
              objectMetadataItem:
                generatedMockObjectMetadataItems.find(
                  (item) => item.nameSingular === 'company',
                ) ?? generatedMockObjectMetadataItems[0],
              recordIndexId: 'recordIndexId',
            }}
          >
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
          </RecordIndexContextProvider>
        </MockedProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  );
};
