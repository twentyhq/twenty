import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { findEnforceableLimits } from 'src/engine/core-modules/usage-limit/utils/find-enforceable-limits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildLimit = (spenderType: SpenderType, id: string): FlatUsageLimit => ({
  id,
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType,
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'quantity',
  limitValueType: 'absolute',
  limitValue: 100,
  burstValue: null,
});

describe('findEnforceableLimits', () => {
  const workspaceLimit = buildLimit('workspace', 'ws');
  const userWorkspaceLimit = buildLimit('userWorkspace', 'uw');
  const apiKeyLimit = buildLimit('apiKey', 'ak');

  it('keeps every limit when the workspace is entitled', () => {
    expect(
      findEnforceableLimits({
        limits: [workspaceLimit, userWorkspaceLimit, apiKeyLimit],
        isIntraWorkspaceLimitEntitled: true,
      }),
    ).toEqual([workspaceLimit, userWorkspaceLimit, apiKeyLimit]);
  });

  it('keeps only workspace-scope limits when not entitled', () => {
    expect(
      findEnforceableLimits({
        limits: [workspaceLimit, userWorkspaceLimit, apiKeyLimit],
        isIntraWorkspaceLimitEntitled: false,
      }),
    ).toEqual([workspaceLimit]);
  });
});
