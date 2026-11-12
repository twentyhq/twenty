import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const makeWorkspace = (
  featureFlags?: Array<{ key: FeatureFlagKey; value: boolean }>,
): Pick<CurrentWorkspace, 'featureFlags'> => ({
  featureFlags,
});

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
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        null,
      ),
    ).toBe(false);
  });

  it('should return false when workspace has no featureFlags', () => {
    const workspace = makeWorkspace(undefined);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        workspace,
      ),
    ).toBe(false);
  });

  it('should return false when feature flag is not found', () => {
    const workspace = makeWorkspace([
      { key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: true },
    ]);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        workspace,
      ),
    ).toBe(false);
  });

  it('should return false when feature flag exists but is disabled', () => {
    const workspace = makeWorkspace([
      { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: false },
    ]);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        workspace,
      ),
    ).toBe(false);
  });

  it('should return true when feature flag exists and is enabled', () => {
    const workspace = makeWorkspace([
      { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: true },
    ]);

    expect(
      checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        workspace,
      ),
    ).toBe(true);
  });
});
