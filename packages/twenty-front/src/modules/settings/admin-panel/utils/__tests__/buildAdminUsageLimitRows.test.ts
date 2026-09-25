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
  isOverridable: true,
  overriddenByUsageLimitId: null,
  ...overrides,
});

const buildLimit = (
  overrides: Partial<WorkspaceUsageLimits['limits'][number]> = {},
): WorkspaceUsageLimits['limits'][number] => ({
  __typename: 'AdminPanelUsageLimit',
  id: 'limit-1',
  periodCount: 1,
  periodUnit: 'lifetime',
  limitValue: 50,
  burstValue: null,
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

  it('leaves a default writable when the server named no row for it', () => {
    const [row] = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [buildDefault()],
        limits: [buildLimit({ id: 'a-limit-of-its-own' })],
      }),
    );

    expect(row.isOverridden).toBe(false);
    expect(row.usageLimitId).toBeNull();
    expect(row.limitValue).toBe(100);
  });

  it('names the period of the row in force, not the one the default implies', () => {
    const [row] = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [
          buildDefault({
            limitKind: 'speed',
            meter: 'quantity',
            periodUnit: 'second',
            periodCount: 30,
            overriddenByUsageLimitId: 'limit-1',
          }),
        ],
        limits: [buildLimit({ periodCount: 60, periodUnit: 'second' })],
      }),
    );

    expect(row.periodCount).toBe(60);
    expect(row.periodUnit).toBe('second');
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

  it('carries the burst value of a speed override', () => {
    const [row] = buildAdminUsageLimitRows(
      buildWorkspaceUsageLimits({
        defaults: [
          buildDefault({
            resourceType: UsageResourceType.API,
            operationType: UsageOperationType.API_REQUEST,
            spenderType: 'apiKey',
            limitKind: 'speed',
            meter: 'quantity',
            periodUnit: 'second',
            periodCount: 60,
            overriddenByUsageLimitId: 'limit-1',
          }),
        ],
        limits: [buildLimit({ burstValue: 20 })],
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
