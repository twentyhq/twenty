/* @license Enterprise */

import { type ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { SsoResolver } from 'src/engine/core-modules/sso/sso.resolver';
import { type SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

// Guards unrelated to permission-flag checks (auth/entitlement) are excluded
// so tests focus purely on which PermissionFlagType each mutation requires,
// without having to fake a full ExecutionContext for them.
const NON_PERMISSION_GUARDS: unknown[] = [
  WorkspaceAuthGuard,
  EnterpriseFeaturesEnabledGuard,
];

describe('SsoResolver', () => {
  let mockPermissionsService: jest.Mocked<PermissionsService>;
  let mockGqlContext: any;
  let mockExecutionContext: ExecutionContext;

  const buildGuardsFor = (methodName: keyof SsoResolver) => {
    const classGuards = Reflect.getMetadata(GUARDS_METADATA, SsoResolver) ?? [];
    const methodGuards =
      Reflect.getMetadata(GUARDS_METADATA, SsoResolver.prototype[methodName]) ??
      [];

    return [...classGuards, ...methodGuards]
      .filter((GuardClass) => !NON_PERMISSION_GUARDS.includes(GuardClass))
      .map((GuardClass) => new GuardClass(mockPermissionsService));
  };

  const runGuardsFor = async (methodName: keyof SsoResolver) => {
    for (const guard of buildGuardsFor(methodName)) {
      // Mirrors Nest's own semantics: every applicable guard must allow the
      // request (logical AND), so a rejection from any of them short-circuits.
      await guard.canActivate(mockExecutionContext);
    }
  };

  beforeEach(() => {
    mockPermissionsService = {
      userHasWorkspaceSettingPermission: jest.fn(),
    } as any;

    mockGqlContext = {
      req: {
        workspace: {
          id: 'workspace-id',
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
        userWorkspaceId: 'user-workspace-id',
        apiKey: null,
      },
    };

    mockExecutionContext = {} as ExecutionContext;

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => mockGqlContext,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([
    'createOIDCIdentityProvider',
    'createSAMLIdentityProvider',
    'editSSOIdentityProvider',
  ] as const)('%s', (methodName) => {
    it('rejects an actor who has IMPERSONATE but not SECURITY permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockImplementation(
        ({ setting }) =>
          Promise.resolve(setting === PermissionFlagType.IMPERSONATE),
      );

      await expect(runGuardsFor(methodName)).rejects.toThrow(
        PermissionsException,
      );

      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ setting: PermissionFlagType.SECURITY }),
      );
    });

    it('rejects an actor who has SECURITY but not IMPERSONATE permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockImplementation(
        ({ setting }) =>
          Promise.resolve(setting === PermissionFlagType.SECURITY),
      );

      await expect(runGuardsFor(methodName)).rejects.toThrow(
        PermissionsException,
      );

      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ setting: PermissionFlagType.IMPERSONATE }),
      );
    });

    it('allows an actor who has both SECURITY and IMPERSONATE permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      await expect(runGuardsFor(methodName)).resolves.not.toThrow();

      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ setting: PermissionFlagType.SECURITY }),
      );
      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ setting: PermissionFlagType.IMPERSONATE }),
      );
    });
  });

  describe('deleteSSOIdentityProvider', () => {
    it('rejects an actor who has IMPERSONATE but not SECURITY permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockImplementation(
        ({ setting }) =>
          Promise.resolve(setting === PermissionFlagType.IMPERSONATE),
      );

      await expect(
        runGuardsFor('deleteSSOIdentityProvider'),
      ).rejects.toThrow(PermissionsException);
    });

    it('only requires SECURITY permission (unchanged)', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockImplementation(
        ({ setting }) =>
          Promise.resolve(setting === PermissionFlagType.SECURITY),
      );

      await expect(
        runGuardsFor('deleteSSOIdentityProvider'),
      ).resolves.not.toThrow();

      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).not.toHaveBeenCalledWith(
        expect.objectContaining({ setting: PermissionFlagType.IMPERSONATE }),
      );
    });
  });
});
