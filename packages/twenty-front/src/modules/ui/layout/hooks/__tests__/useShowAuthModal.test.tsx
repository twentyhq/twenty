import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { AppPath } from '@/types/AppPath';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

jest.mock('~/hooks/useIsMatchingLocation');
const mockUseIsMatchingLocation = jest.mocked(useIsMatchingLocation);

const setupMockIsMatchingLocation = (pathname: string) => {
  mockUseIsMatchingLocation.mockReturnValueOnce({
    isMatchingLocation: (path: string) => path === pathname,
  });
};

const getResult = () =>
  renderHook(
    () => {
      return useShowAuthModal();
    },
    {
      wrapper: RecoilRoot,
    },
  );

const testCases = [
  { loc: AppPath.Verify, res: true },
  { loc: AppPath.VerifyEmail, res: true },
  { loc: AppPath.SignInUp, res: true },
  { loc: AppPath.Invite, res: true },
  { loc: AppPath.ResetPassword, res: true },
  { loc: AppPath.CreateWorkspace, res: true },
  { loc: AppPath.SyncEmails, res: true },
  { loc: AppPath.InviteTeam, res: true },
  { loc: AppPath.PlanRequired, res: true },
  { loc: AppPath.PlanRequiredSuccess, res: true },

  { loc: AppPath.Index, res: false },
  { loc: AppPath.TasksPage, res: false },
  { loc: AppPath.OpportunitiesPage, res: false },
  { loc: AppPath.RecordIndexPage, res: false },
  { loc: AppPath.RecordShowPage, res: false },
  { loc: AppPath.SettingsCatchAll, res: false },
  { loc: AppPath.DevelopersCatchAll, res: false },
  { loc: AppPath.Authorize, res: false },
  { loc: AppPath.NotFoundWildcard, res: false },
  { loc: AppPath.NotFound, res: false },
];

describe('useShowAuthModal', () => {
  testCases.forEach((testCase) => {
    it(`testCase for location ${testCase.loc} should return ${testCase.res}`, () => {
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
