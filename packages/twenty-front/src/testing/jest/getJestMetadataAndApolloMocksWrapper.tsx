import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';

export const getJestMetadataAndApolloMocksWrapper = ({
  apolloMocks,
  onInitializeRecoilSnapshot,
}: {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
  onInitializeRecoilSnapshot?: (snapshot: MutableSnapshot) => void;
}) => {
  return ({ children }: { children: ReactNode }) => (
    <RecoilRoot initializeState={onInitializeRecoilSnapshot}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <MockedProvider mocks={apolloMocks} addTypename={false}>
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId: 'instanceId' }}
          >
            <JestObjectMetadataItemSetter>
              {children}
            </JestObjectMetadataItemSetter>
          </RecordFiltersComponentInstanceContext.Provider>
        </MockedProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  );
};
