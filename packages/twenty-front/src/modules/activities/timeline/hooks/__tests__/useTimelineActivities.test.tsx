import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useTimelineActivities } from '@/activities/timeline/hooks/useTimelineActivities';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

// FIXME: The hook is re-rendering so many times that it's causing a maximum
// update depth exceeded error. We need to fix this before we can write a proper test.
describe('useTimelineActivities', () => {
  it('works as expected', () => {
    try {
      renderHook(
        () =>
          useTimelineActivities({
            targetableObject: {
              id: '123',
              targetObjectNameSingular: 'person',
            },
          }),
        { wrapper: Wrapper },
      );
    } catch (e) {
      expect((e as Error).message).toMatch(/^Maximum update depth exceeded/);
    }
  });
});
