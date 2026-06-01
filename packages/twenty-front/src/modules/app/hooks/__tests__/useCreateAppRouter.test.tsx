jest.mock('@/app/components/AppRouterProviders', () => ({
  AppRouterProviders: () => null,
}));

jest.mock('@/app/components/LazyRoute', () => ({
  LazyRoute: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/app/components/SettingsRoutes', () => ({
  SettingsRoutes: () => null,
}));

jest.mock('@/auth/components/VerifyEmailEffect', () => ({
  VerifyEmailEffect: () => null,
}));

jest.mock('@/auth/components/VerifyLoginTokenEffect', () => ({
  VerifyLoginTokenEffect: () => null,
}));

jest.mock('@/navigation/utils/indexAppPath', () => ({
  __esModule: true,
  default: {
    getIndexAppPath: () => '/',
  },
}));

jest.mock('@/ui/layout/page/components/BlankLayout', () => ({
  BlankLayout: () => null,
}));

jest.mock('@/ui/layout/page/components/DefaultLayout', () => ({
  DefaultLayout: () => null,
}));

import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { SHAHRYAR_APP_PATHS } from '@/shahryar/constants/shahryar-routes';
import { Request as CrossFetchRequest } from 'cross-fetch';
import { type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';

type TestRoute = {
  path?: string;
  children?: TestRoute[];
};

const collectRoutePaths = (routes: TestRoute[]): Set<string> =>
  routes.reduce<Set<string>>((paths, route) => {
    if (route.path !== undefined) {
      paths.add(route.path);
    }

    if (route.children !== undefined) {
      for (const childPath of collectRoutePaths(route.children)) {
        paths.add(childPath);
      }
    }

    return paths;
  }, new Set<string>());

describe('useCreateAppRouter', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'Request', {
      configurable: true,
      value: CrossFetchRequest as typeof Request,
    });
  });

  it('hides removed CRM and onboarding routes in Shahryar mode', () => {
    const router = useCreateAppRouter();
    const paths = collectRoutePaths(router.routes as TestRoute[]);

    expect([...paths]).toEqual(
      expect.not.arrayContaining([
        AppPath.SyncEmails,
        AppPath.PlanRequired,
        AppPath.PlanRequiredSuccess,
        AppPath.BookCallDecision,
        AppPath.BookCall,
        AppPath.RecordIndexPage,
        AppPath.RecordShowPage,
        AppPath.PageLayoutPage,
        AppPath.Authorize,
      ]),
    );
  });

  it('exposes Shahryar operational routes in Shahryar mode', () => {
    const router = useCreateAppRouter();
    const paths = collectRoutePaths(router.routes as TestRoute[]);

    expect([...paths]).toEqual(
      expect.arrayContaining([
        SHAHRYAR_APP_PATHS.Dashboard,
        SHAHRYAR_APP_PATHS.Markets,
        SHAHRYAR_APP_PATHS.SupervisorVisits,
        SHAHRYAR_APP_PATHS.WorkingTimes,
        SHAHRYAR_APP_PATHS.Reports,
        SHAHRYAR_APP_PATHS.Admin,
        SHAHRYAR_APP_PATHS.MobileApp,
        SHAHRYAR_APP_PATHS.Payments,
        SHAHRYAR_APP_PATHS.SupervisorPenalties,
        SHAHRYAR_APP_PATHS.Absences,
        SHAHRYAR_APP_PATHS.Backups,
      ]),
    );
  });
});
