import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { isAccessPolicySatisfied } from 'src/engine/guards/utils/is-access-policy-satisfied.util';

const ROLE_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: true,
    apiKey: true,
    oauthClient: true,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.ROLES],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
};

const ENABLED_FEATURE_FLAGS = {
  [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: true,
} as FeatureFlagMap;

const checkMemberAccess = ({
  featureFlagsMap = ENABLED_FEATURE_FLAGS,
  isPermissionFlagGranted = jest.fn().mockResolvedValue(true),
}: {
  featureFlagsMap?: FeatureFlagMap;
  isPermissionFlagGranted?: jest.Mock;
} = {}) =>
  isAccessPolicySatisfied({
    accessPolicy: ROLE_WRITE_ACCESS_POLICY,
    authPrincipalVariant: { kind: 'userSession', variant: 'standard' },
    featureFlagsMap,
    isPermissionFlagGranted,
  });

describe('isAccessPolicySatisfied', () => {
  it('should admit a principal the policy accepts once its flags are granted', async () => {
    const isPermissionFlagGranted = jest.fn().mockResolvedValue(true);

    expect(await checkMemberAccess({ isPermissionFlagGranted })).toBe(true);
    expect(isPermissionFlagGranted).toHaveBeenCalledWith(
      PermissionFlagType.ROLES,
    );
  });

  it.each([
    [
      'a principal the policy refuses',
      { kind: 'application', variant: 'withoutUser', withAgent: false },
    ],
    ['no principal', undefined],
  ] as const)(
    'should refuse %s without checking its permission flags',
    async (_, authPrincipalVariant) => {
      const isPermissionFlagGranted = jest.fn().mockResolvedValue(true);

      expect(
        await isAccessPolicySatisfied({
          accessPolicy: ROLE_WRITE_ACCESS_POLICY,
          authPrincipalVariant,
          featureFlagsMap: ENABLED_FEATURE_FLAGS,
          isPermissionFlagGranted,
        }),
      ).toBe(false);
      expect(isPermissionFlagGranted).not.toHaveBeenCalled();
    },
  );

  it('should refuse when a required feature flag is off for the workspace', async () => {
    expect(
      await checkMemberAccess({ featureFlagsMap: {} as FeatureFlagMap }),
    ).toBe(false);
  });

  it('should refuse when a required permission flag is not granted', async () => {
    expect(
      await checkMemberAccess({
        isPermissionFlagGranted: jest.fn().mockResolvedValue(false),
      }),
    ).toBe(false);
  });
});
