import { buildConditionalAvailabilityGlobalContext } from '@/conditional-availability/utils/buildConditionalAvailabilityGlobalContext';

describe('buildConditionalAvailabilityGlobalContext', () => {
  it('should expose the current workspace member and its role', () => {
    expect(
      buildConditionalAvailabilityGlobalContext({
        featureFlags: { IS_AI_ENABLED: true },
        permissionFlags: { ROLES: true },
        currentWorkspaceMember: {
          id: 'workspace-member-id',
          roles: [{ universalIdentifier: 'sales-role-universal-identifier' }],
        },
      }),
    ).toEqual({
      featureFlags: { IS_AI_ENABLED: true },
      permissionFlags: { ROLES: true },
      currentRole: { universalIdentifier: 'sales-role-universal-identifier' },
      currentWorkspaceMember: { id: 'workspace-member-id' },
    });
  });

  it('should have no role when the workspace member has none loaded', () => {
    expect(
      buildConditionalAvailabilityGlobalContext({
        featureFlags: {},
        permissionFlags: {},
        currentWorkspaceMember: { id: 'workspace-member-id' },
      }),
    ).toMatchObject({
      currentRole: null,
      currentWorkspaceMember: { id: 'workspace-member-id' },
    });
  });

  it('should have no member and no role when no workspace member is loaded', () => {
    expect(
      buildConditionalAvailabilityGlobalContext({
        featureFlags: {},
        permissionFlags: {},
        currentWorkspaceMember: null,
      }),
    ).toEqual({
      featureFlags: {},
      permissionFlags: {},
      currentRole: null,
      currentWorkspaceMember: null,
    });
  });
});
