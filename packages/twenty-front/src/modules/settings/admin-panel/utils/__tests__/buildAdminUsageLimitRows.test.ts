import { buildAdminUsageLimitRows } from '@/settings/admin-panel/utils/buildAdminUsageLimitRows';
import {
  UsageOperationType,
  UsageResourceType,
  type WorkspaceUsageLimitsQuery,
} from '~/generated-admin/graphql';

type WorkspaceUsageLimits = WorkspaceUsageLimitsQuery['workspaceUsageLimits'];

const buildDefault = (
  overrides: Partial<WorkspaceUsageLimits['defaults'][number]> = {},
): WorkspaceUsageLimits['defaults'][number] => ({
  __typename: 'AdminPanelUsageLimitDefault',
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  limitKind: 'stock',
  periodCount: 1,
  periodUnit: 'lifetime',
  meter: 'bytes',
  limitValue: 100,
  limitValueConfigVariable: 'WORKSPACE_STORAGE_LIMIT_BYTES',
  windowMsConfigVariable: null,
  counterScope: null,
  isOverridable: true,
  isEnforcedOnCurrentPlan: true,
  overriddenByUsageLimitId: null,
  ...overrides,
});

const buildLimit = (
  overrides: Partial<WorkspaceUsageLimits['limits'][number]> = {},
): WorkspaceUsageLimits['limits'][number] => ({
  __typename: 'AdminPanelUsageLimit',
  id: 'limit-1',
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'stock',
  periodCount: 1,
  periodUnit: 'lifetime',
  meter: 'bytes',
  limitValue: 50,
  burstValue: null,
  isEnforcedOnCurrentPlan: true,
  suppressesDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const buildWorkspaceUsageLimits = ({
  defaults = [],
  limits = [],
}: {
  defaults?: WorkspaceUsageLimits['defaults'];
  limits?: WorkspaceUsageLimits['limits'];
}): WorkspaceUsageLimits => ({
  __typename: 'AdminPanelWorkspaceUsageLimits',
  defaults,
  limits,
});

// The two API speed defaults differ only by window, and one override replaces
// both, which is the case the table has to stay honest about.
const buildApiSpeedDefault = (
  periodCount: number,
  overrides: Partial<WorkspaceUsageLimits['defaults'][number]> = {},
) =>
  buildDefault({
    resourceType: UsageResourceType.API,
    operationType: UsageOperationType.API_REQUEST,
    spenderType: 'apiKey',
    limitKind: 'speed',
    meter: 'quantity',
    periodUnit: 'second',
    periodCount,
    ...overrides,
  });

describe('buildAdminUsageLimitRows', () => {
  it('shows one row per overridable default', () => {
    const rows = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [buildDefault({ overriddenByUsageLimitId: 'limit-1' })],
        limits: [buildLimit()],
      }),
    );

    expect(rows).toHaveLength(1);
  });

  it('reports a default as overridden and shows the override value', () => {
    const [row] = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [buildDefault({ overriddenByUsageLimitId: 'limit-1' })],
        limits: [buildLimit({ limitValue: 50 })],
      }),
    );

    expect(row.isOverridden).toBe(true);
    expect(row.usageLimitId).toBe('limit-1');
    expect(row.limitValue).toBe(50);
    expect(row.defaultValue).toBe(100);
  });

  it('shows the instance value on a default nothing replaced', () => {
    const [row] = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({ defaults: [buildDefault()] }),
    );

    expect(row.isOverridden).toBe(false);
    expect(row.usageLimitId).toBeNull();
    expect(row.limitValue).toBe(100);
  });

  it('leaves a default suppressed by another period writable, so it can be restated', () => {
    const rows = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [
          buildApiSpeedDefault(1, { overriddenByUsageLimitId: 'limit-1' }),
          buildApiSpeedDefault(60, { overriddenByUsageLimitId: 'limit-1' }),
        ],
        limits: [
          buildLimit({
            resourceType: UsageResourceType.API,
            operationType: UsageOperationType.API_REQUEST,
            spenderType: 'apiKey',
            limitKind: 'speed',
            meter: 'quantity',
            periodUnit: 'second',
            periodCount: 1,
          }),
        ],
      }),
    );

    const covered = rows.find((row) => row.periodCount === 1);
    const suppressedElsewhere = rows.find((row) => row.periodCount === 60);

    expect(covered?.isOverridden).toBe(true);
    expect(suppressedElsewhere?.isOverridden).toBe(false);
    expect(suppressedElsewhere?.usageLimitId).toBeNull();
  });

  it('counts how many overridable defaults one override would replace at once', () => {
    const rows = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [buildApiSpeedDefault(1), buildApiSpeedDefault(60)],
      }),
    );

    expect(rows.map((row) => row.suppressedTogetherCount)).toEqual([2, 2]);
  });

  it('leaves out defaults no row may replace', () => {
    expect(
      buildAdminUsageLimitRows(
        buildWorkspaceUsageLimits({
          defaults: [buildDefault({ isOverridable: false })],
        }),
      ),
    ).toEqual([]);
  });

  it('leaves out limits the workspace set for itself', () => {
    expect(
      buildAdminUsageLimitRows(
        buildWorkspaceUsageLimits({
          limits: [buildLimit({ suppressesDefault: false })],
        }),
      ),
    ).toEqual([]);
  });

  it('carries the burst value of a speed override', () => {
    const [row] = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [
          buildApiSpeedDefault(1, { overriddenByUsageLimitId: 'limit-1' }),
        ],
        limits: [
          buildLimit({
            resourceType: UsageResourceType.API,
            operationType: UsageOperationType.API_REQUEST,
            spenderType: 'apiKey',
            limitKind: 'speed',
            meter: 'quantity',
            periodUnit: 'second',
            periodCount: 1,
            burstValue: 20,
          }),
        ],
      }),
    );

    expect(row.burstValue).toBe(20);
  });

  it('groups rows of one resource and kind together', () => {
    const rows = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [
          buildDefault({
            resourceType: UsageResourceType.WEBHOOK,
            operationType: UsageOperationType.WEBHOOK_CALL,
            limitKind: 'speed',
            meter: 'quantity',
          }),
          buildDefault(),
        ],
      }),
    );

    expect(rows.map((row) => row.resourceType)).toEqual([
      UsageResourceType.STORAGE,
      UsageResourceType.WEBHOOK,
    ]);
  });
});
