import { renderHook } from '@testing-library/react';
import * as reactRouterDom from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { useShowBookCallModal } from '@/onboarding/hooks/useShowBookCallModal';
import { AppPath } from '@/types/AppPath';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

const mockUseLocation = reactRouterDom.useLocation as jest.Mock;

jest.mock('~/utils/isMatchingLocation');
const mockIsMatchingLocation = jest.mocked(isMatchingLocation);

const setupMockIsMatchingLocation = (pathname: string) => {
  mockUseLocation.mockReturnValue({ pathname });
  mockIsMatchingLocation.mockImplementation(
    (_location, path) => path === pathname,
  );
};

const getResult = () =>
  renderHook(
    () => {
      return useShowBookCallModal();
    },
    {
      wrapper: RecoilRoot,
    },
  );

const testCases = [
  { loc: AppPath.BookCall, res: true },
  { loc: AppPath.Verify, res: false },
  { loc: AppPath.VerifyEmail, res: false },
  { loc: AppPath.SignInUp, res: false },
  { loc: AppPath.Invite, res: false },
  { loc: AppPath.ResetPassword, res: false },
  { loc: AppPath.CreateWorkspace, res: false },
  { loc: AppPath.SyncEmails, res: false },
  { loc: AppPath.InviteTeam, res: false },
  { loc: AppPath.PlanRequired, res: false },
  { loc: AppPath.PlanRequiredSuccess, res: false },
  { loc: AppPath.BookOnboardingDecision, res: false },
  { loc: AppPath.Index, res: false },
  { loc: AppPath.RecordIndexPage, res: false },
  { loc: AppPath.RecordShowPage, res: false },
  { loc: AppPath.SettingsCatchAll, res: false },
  { loc: AppPath.DevelopersCatchAll, res: false },
  { loc: AppPath.Authorize, res: false },
  { loc: AppPath.NotFoundWildcard, res: false },
  { loc: AppPath.NotFound, res: false },
];

describe('useShowBookCallModal', () => {
  testCases.forEach((testCase) => {
    it(`should return ${testCase.res} for location ${testCase.loc}`, () => {
      setupMockIsMatchingLocation(testCase.loc);
      const { result } = getResult();
      if (testCase.res) {
        expect(result.current).toBeTruthy();
      } else {
        expect(result.current).toBeFalsy();
      }
    });
  });
});
