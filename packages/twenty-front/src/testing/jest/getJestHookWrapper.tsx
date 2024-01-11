import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { MutableSnapshot, RecoilRoot } from 'recoil';

import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

export const getJestHookWrapper = ({
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
          {children}
        </MockedProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  );
};
