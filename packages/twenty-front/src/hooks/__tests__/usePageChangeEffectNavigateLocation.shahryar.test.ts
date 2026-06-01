jest.mock('~/config', () => ({
  __esModule: true,
  REACT_APP_SHAHRYAR_MODE: true,
}));

import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useQuery } from '@apollo/client/react';
import { renderHook } from '@testing-library/react';
import { useLocation, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { SHAHRYAR_APP_PATHS } from '@/shahryar/constants/shahryar-routes';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

jest.mock('@/auth/hooks/useHasAccessTokenPair');
jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace');
jest.mock('@/navigation/hooks/useDefaultHomePagePath');
jest.mock('@/onboarding/hooks/useOnboardingStatus');
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
jest.mock('@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo');
jest.mock('@apollo/client/react');
jest.mock('react-router-dom');
jest.mock('~/utils/isMatchingLocation');

const setupShahryarRedirectTest = ({
  isOnAWorkspace = true,
  locationPath,
  onboardingStatus,
}: {
  isOnAWorkspace?: boolean;
  locationPath: AppPath | string;
  onboardingStatus: OnboardingStatus;
}) => {
  jest.mocked(useHasAccessTokenPair).mockReturnValue(true);
  jest.mocked(useIsCurrentLocationOnAWorkspace).mockReturnValue({
    isOnAWorkspace,
  });
  jest.mocked(useDefaultHomePagePath).mockReturnValue({
    defaultHomePagePath: SHAHRYAR_APP_PATHS.Dashboard,
  });
  jest.mocked(useOnboardingStatus).mockReturnValue(onboardingStatus);
  jest.mocked(useIsWorkspaceActivationStatusEqualsTo).mockReturnValue(false);
  jest.mocked(useLocation).mockReturnValue({
    pathname: locationPath,
    search: '',
    hash: '',
    state: null,
    key: 'test-location',
  });
  jest.mocked(useParams).mockReturnValue({});
  jest
    .mocked(useAtomStateValue)
    .mockReturnValueOnce('mock-calendar-id')
    .mockReturnValueOnce([])
    .mockReturnValueOnce(undefined)
    .mockReturnValueOnce('');
  jest.mocked(useQuery).mockReturnValue({
    data: undefined,
    loading: false,
  } as ReturnType<typeof useQuery>);
  jest
    .mocked(isMatchingLocation)
    .mockImplementation((_location, path) => path === locationPath);
};

describe('usePageChangeEffectNavigateLocation in Shahryar mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not redirect Shahryar dashboard users to the hidden sync email route', () => {
    setupShahryarRedirectTest({
      locationPath: SHAHRYAR_APP_PATHS.Dashboard,
      onboardingStatus: OnboardingStatus.SYNC_EMAIL,
    });

    const { result } = renderHook(() => usePageChangeEffectNavigateLocation());

    expect(result.current).toBeUndefined();
  });

  it('keeps authenticated Shahryar users on default-domain Shahryar routes', () => {
    setupShahryarRedirectTest({
      isOnAWorkspace: false,
      locationPath: SHAHRYAR_APP_PATHS.Dashboard,
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    const { result } = renderHook(() => usePageChangeEffectNavigateLocation());

    expect(result.current).toBeUndefined();
  });

  it('redirects old onboarding-only routes to the Shahryar dashboard', () => {
    setupShahryarRedirectTest({
      locationPath: AppPath.SyncEmails,
      onboardingStatus: OnboardingStatus.SYNC_EMAIL,
    });

    const { result } = renderHook(() => usePageChangeEffectNavigateLocation());

    expect(result.current).toBe(SHAHRYAR_APP_PATHS.Dashboard);
  });
});
