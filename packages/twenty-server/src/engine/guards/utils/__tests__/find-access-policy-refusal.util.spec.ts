import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { findAccessPolicyRefusal } from 'src/engine/guards/utils/find-access-policy-refusal.util';

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

const findMemberRefusal = ({
  isFeatureFlagEnabled = () => true,
  isPermissionFlagGranted = jest.fn().mockResolvedValue(true),
}: {
  isFeatureFlagEnabled?: () => boolean;
  isPermissionFlagGranted?: jest.Mock;
} = {}) =>
  findAccessPolicyRefusal({
    accessPolicy: ROLE_WRITE_ACCESS_POLICY,
    authPrincipalVariant: { kind: 'userSession', variant: 'standard' },
    isFeatureFlagEnabled,
    isPermissionFlagGranted,
  });

describe('findAccessPolicyRefusal', () => {
  it('should find no refusal for a principal the policy accepts once its flags are granted', async () => {
    const isPermissionFlagGranted = jest.fn().mockResolvedValue(true);

    expect(await findMemberRefusal({ isPermissionFlagGranted })).toBeUndefined();
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
    'should refuse %s without checking its flags',
    async (_, authPrincipalVariant) => {
      const isPermissionFlagGranted = jest.fn().mockResolvedValue(true);

      expect(
        await findAccessPolicyRefusal({
          accessPolicy: ROLE_WRITE_ACCESS_POLICY,
          authPrincipalVariant,
          isFeatureFlagEnabled: () => true,
          isPermissionFlagGranted,
        }),
      ).toEqual({ reason: 'authPrincipal' });
      expect(isPermissionFlagGranted).not.toHaveBeenCalled();
    },
  );

  it('should name the required feature flag that is off for the workspace', async () => {
    expect(
      await findMemberRefusal({ isFeatureFlagEnabled: () => false }),
    ).toEqual({
      reason: 'featureFlag',
      featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    });
  });

  it('should name the required permission flag that is not granted', async () => {
    expect(
      await findMemberRefusal({
        isPermissionFlagGranted: jest.fn().mockResolvedValue(false),
      }),
    ).toEqual({
      reason: 'permissionFlag',
      permissionFlag: PermissionFlagType.ROLES,
    });
  });
});
