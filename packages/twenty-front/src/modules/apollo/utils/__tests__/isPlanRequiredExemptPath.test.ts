import { AppPath } from 'twenty-shared/types';

import { isPlanRequiredExemptPath } from '@/apollo/utils/isPlanRequiredExemptPath';

const loc = (pathname: string) =>
  ({
    pathname,
    search: '',
    hash: '',
    state: null,
    key: 'test',
  }) as const;

describe('isPlanRequiredExemptPath', () => {
  it('skips navigation on plan-required onboarding paths', () => {
    expect(isPlanRequiredExemptPath(loc(AppPath.PlanRequired))).toBe(true);
    expect(isPlanRequiredExemptPath(loc(AppPath.PlanRequiredSuccess))).toBe(
      true,
    );
    expect(isPlanRequiredExemptPath(loc(AppPath.BookCall))).toBe(true);
  });

  it('allows navigation from product deep links', () => {
    expect(isPlanRequiredExemptPath(loc('/objects/companies'))).toBe(false);
    expect(isPlanRequiredExemptPath(loc(AppPath.RecordIndexPage))).toBe(false);
    expect(isPlanRequiredExemptPath(loc('/'))).toBe(false);
  });
});
