import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';

import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { InMemoryCache } from '@apollo/client';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';
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
      <SnackBarComponentInstanceContext.Provider
        value={{ instanceId: 'snack-bar-manager' }}
      >
        <MockedProvider mocks={apolloMocks} addTypename={false} cache={cache}>
          <RecordFilterGroupsComponentInstanceContext.Provider
            value={{ instanceId: 'instanceId' }}
          >
            <RecordFiltersComponentInstanceContext.Provider
              value={{ instanceId: 'instanceId' }}
            >
              <RecordSortsComponentInstanceContext.Provider
                value={{ instanceId: 'instanceId' }}
              >
                <ViewComponentInstanceContext.Provider
                  value={{ instanceId: 'instanceId' }}
                >
                  <JestObjectMetadataItemSetter>
                    <ContextStoreComponentInstanceContext.Provider
                      value={{ instanceId: 'instanceId' }}
                    >
                      <JestContextStoreSetter>
                        {children}
                      </JestContextStoreSetter>
                    </ContextStoreComponentInstanceContext.Provider>
                  </JestObjectMetadataItemSetter>
                </ViewComponentInstanceContext.Provider>
              </RecordSortsComponentInstanceContext.Provider>
            </RecordFiltersComponentInstanceContext.Provider>
          </RecordFilterGroupsComponentInstanceContext.Provider>
        </MockedProvider>
      </SnackBarComponentInstanceContext.Provider>
    </RecoilRoot>
  );
};
