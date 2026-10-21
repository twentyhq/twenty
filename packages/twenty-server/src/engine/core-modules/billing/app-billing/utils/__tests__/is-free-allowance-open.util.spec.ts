import { isFreeAllowanceOpen } from 'src/engine/core-modules/billing/app-billing/utils/is-free-allowance-open.util';

const INSTALLED_AT = new Date('2026-11-01T00:00:00.000Z');
const WORKSPACE_CREATED_AT = new Date('2026-11-01T00:00:00.000Z');

describe('isFreeAllowanceOpen', () => {
  it('should be open within the duration counted from the install', () => {
    expect(
      isFreeAllowanceOpen({
        freeAllowance: { durationInDays: 60 },
        installedAt: INSTALLED_AT,
        workspaceCreatedAt: WORKSPACE_CREATED_AT,
        now: new Date('2026-12-30T23:59:59.999Z'),
      }),
    ).toBe(true);
  });

  it('should close once the duration has elapsed', () => {
    expect(
      isFreeAllowanceOpen({
        freeAllowance: { durationInDays: 60 },
        installedAt: INSTALLED_AT,
        workspaceCreatedAt: WORKSPACE_CREATED_AT,
        now: new Date('2026-12-31T00:00:00.000Z'),
      }),
    ).toBe(false);
  });

  it('should stay open without a duration, leaving the quantity as the only bound', () => {
    expect(
      isFreeAllowanceOpen({
        freeAllowance: { quantity: 3000 },
        installedAt: INSTALLED_AT,
        workspaceCreatedAt: WORKSPACE_CREATED_AT,
        now: new Date('2030-01-01T00:00:00.000Z'),
      }),
    ).toBe(true);
  });

  it('should exclude workspaces created before workspaceCreatedFrom', () => {
    expect(
      isFreeAllowanceOpen({
        freeAllowance: {
          durationInDays: 60,
          workspaceCreatedFrom: '2026-10-22T00:00:00.000Z',
        },
        installedAt: INSTALLED_AT,
        workspaceCreatedAt: new Date('2026-10-21T23:59:59.999Z'),
        now: INSTALLED_AT,
      }),
    ).toBe(false);
  });

  it('should include workspaces created at workspaceCreatedFrom', () => {
    expect(
      isFreeAllowanceOpen({
        freeAllowance: {
          durationInDays: 60,
          workspaceCreatedFrom: '2026-10-22T00:00:00.000Z',
        },
        installedAt: INSTALLED_AT,
        workspaceCreatedAt: new Date('2026-10-22T00:00:00.000Z'),
        now: INSTALLED_AT,
      }),
    ).toBe(true);
  });
});
