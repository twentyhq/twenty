import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { findEnforceableLimits } from 'src/engine/core-modules/usage-limit/utils/find-enforceable-limits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const buildLimit = (
  spenderType: SpenderType,
  id: string,
  isInstanceOverride = false,
): FlatUsageLimit => ({
  id,
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType,
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'quantity',
  limitValue: 100,
  burstValue: null,
  isInstanceOverride,
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

  it('keeps an operator override on an unentitled workspace, since the plan sells what a tenant may cap, not what the instance may', () => {
    const operatorApiKeyLimit = buildLimit('apiKey', 'operator-ak', true);

    expect(
      findEnforceableLimits({
        limits: [userWorkspaceLimit, apiKeyLimit, operatorApiKeyLimit],
        isIntraWorkspaceLimitEntitled: false,
      }),
    ).toEqual([operatorApiKeyLimit]);
  });
});
