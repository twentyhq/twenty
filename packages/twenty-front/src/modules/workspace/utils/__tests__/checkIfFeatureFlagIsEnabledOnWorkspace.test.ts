import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';

const makeWorkspace = (
  featureFlags?: Array<{ key: string; value: boolean; id: string }>,
): CurrentWorkspace =>
  ({
    id: 'workspace-1',
    featureFlags,
  }) as unknown as CurrentWorkspace;

describe('checkIfFeatureFlagIsEnabledOnWorkspace', () => {
  it('should return false when featureKey is null', () => {
    const workspace = makeWorkspace([]);

    expect(checkIfFeatureFlagIsEnabledOnWorkspace(null, workspace)).toBe(false);
  });

  it('should return false when featureKey is undefined', () => {
    const workspace = makeWorkspace([]);

    expect(checkIfFeatureFlagIsEnabledOnWorkspace(undefined, workspace)).toBe(
      false,
    );
  });

  it('should return false when workspace is null', () => {
    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        'IS_AIRTABLE_INTEGRATION_ENABLED' as any,
        null,
      ),
    ).toBe(false);
  });

  it('should return false when workspace has no featureFlags', () => {
    const workspace = makeWorkspace(undefined);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        'IS_AIRTABLE_INTEGRATION_ENABLED' as any,
        workspace,
      ),
    ).toBe(false);
  });

  it('should return false when feature flag is not found', () => {
    const workspace = makeWorkspace([
      { key: 'OTHER_FLAG', value: true, id: 'flag-1' },
    ]);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        'IS_AIRTABLE_INTEGRATION_ENABLED' as any,
        workspace,
      ),
    ).toBe(false);
  });

  it('should return false when feature flag exists but is disabled', () => {
    const workspace = makeWorkspace([
      { key: 'IS_AIRTABLE_INTEGRATION_ENABLED', value: false, id: 'flag-1' },
    ]);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        'IS_AIRTABLE_INTEGRATION_ENABLED' as any,
        workspace,
      ),
    ).toBe(false);
  });

  it('should return true when feature flag exists and is enabled', () => {
    const workspace = makeWorkspace([
      { key: 'IS_AIRTABLE_INTEGRATION_ENABLED', value: true, id: 'flag-1' },
    ]);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        'IS_AIRTABLE_INTEGRATION_ENABLED' as any,
        workspace,
      ),
    ).toBe(true);
  });
});
