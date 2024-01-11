import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { RecoilRoot } from 'recoil';

import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

export const getJestHookWrapper = ({
  apolloMocks,
}: {
  apolloMocks:
    | readonly MockedResponse<Record<string, any>, Record<string, any>>[]
    | undefined;
}) => {
  return ({ children }: { children: ReactNode }) => (
    <RecoilRoot>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <MockedProvider mocks={apolloMocks} addTypename={false}>
          {children}
        </MockedProvider>
      </SnackBarProviderScope>
    </RecoilRoot>
  );
};
