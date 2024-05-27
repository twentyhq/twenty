import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useIsMockedDrawerPage } from '@/navigation/hooks/useIsMockedDrawerPage';
import { AppPath } from '@/types/AppPath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

jest.mock('~/hooks/useIsMatchingLocation');
const mockUseIsMatchingLocation = jest.mocked(useIsMatchingLocation);

const setupMockIsMatchingLocation = (pathname: string) => {
  mockUseIsMatchingLocation.mockReturnValueOnce(
    (path: string) => path === pathname,
  );
};

const getResult = () =>
  renderHook(
    () => {
      return useIsMockedDrawerPage();
    },
    {
      wrapper: RecoilRoot,
    },
  );

const shouldReturnTrueLocations = [
  AppPath.Verify,
  AppPath.Invite,
  AppPath.SignInUp,
  AppPath.ResetPassword,
  AppPath.CreateWorkspace,
  AppPath.PlanRequired,
  AppPath.PlanRequiredSuccess,
];

describe('useIsMockedDrawerPage', () => {
  Object.values(AppPath).forEach((location) => {
    const expectedResult = shouldReturnTrueLocations.includes(location);
    it(`should return ${
      expectedResult ? 'true' : 'false'
    } for location ${location}`, () => {
      setupMockIsMatchingLocation(location);
      const { result } = getResult();
      if (expectedResult) {
        expect(result.current).toBeTruthy();
      } else {
        expect(result.current).toBeFalsy();
      }
    });
  });
});
