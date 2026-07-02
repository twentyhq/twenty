import { BadRequestException, NotFoundException } from '@nestjs/common';

import { InternalWorkspaceProvisioningService } from 'src/engine/core-modules/auth/services/internal-workspace-provisioning.service';

describe('InternalWorkspaceProvisioningService', () => {
  const workspace = {
    id: '20202020-0000-4000-8000-000000000001',
    displayName: 'Acme',
    subdomain: 'acme',
  };
  const user = {
    id: 'user-id',
    email: 'twenty-workspace-provisioning@regie.ai',
    firstName: 'Regie',
    lastName: 'Provisioning',
    isEmailVerified: true,
    disabled: false,
    canImpersonate: false,
    canAccessFullAdminPanel: false,
    locale: 'en',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  };
  const flatUser = {
    ...user,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: undefined,
  };

  const makeService = () => {
    const signInUpService = {
      signUpOnNewWorkspace: jest.fn().mockResolvedValue({ user, workspace }),
    };
    const userService = {
      findUserByEmail: jest.fn().mockResolvedValue(user),
    };
    const workspaceService = {
      activateWorkspace: jest.fn().mockResolvedValue({
        ...workspace,
        displayName: 'Acme Activated',
      }),
      findOneWorkspaceById: jest.fn().mockResolvedValue(workspace),
    };
    const apiKeyService = {
      createWorkspaceAdminApiKeyToken: jest.fn().mockResolvedValue({
        apiKeyId: 'api-key-id',
        token: 'api-key-token',
      }),
    };

    const service = new InternalWorkspaceProvisioningService(
      signInUpService as any,
      userService as any,
      workspaceService as any,
      apiKeyService as any,
    );

    return {
      service,
      signInUpService,
      userService,
      workspaceService,
      apiKeyService,
    };
  };

  it('creates and activates a workspace with the reusable service user', async () => {
    const { service, signInUpService, userService, workspaceService } =
      makeService();

    const result = await service.createWorkspace({
      name: ' Acme ',
      slug: ' acme ',
      primaryDomain: 'https://crm.acme.test',
      serviceUserEmail: ' Provisioning@REGIE.AI ',
    });

    expect(userService.findUserByEmail).toHaveBeenCalledWith(
      'provisioning@regie.ai',
    );
    expect(signInUpService.signUpOnNewWorkspace).toHaveBeenCalledWith(
      {
        type: 'existingUser',
        existingUser: user,
      },
      {
        displayName: 'Acme',
        subdomain: 'acme',
        shouldBypassWorkspaceCreationChecks: true,
      },
    );
    expect(workspaceService.activateWorkspace).toHaveBeenCalledWith(
      flatUser,
      workspace,
    );
    expect(result).toEqual({
      ok: true,
      id: workspace.id,
      workspaceId: workspace.id,
      workspaceUrl: 'https://crm.acme.test',
      workspaceName: 'Acme Activated',
      workspaceSubdomain: 'acme',
    });
  });

  it('creates the service user through signup when missing', async () => {
    const { service, signInUpService, userService } = makeService();

    userService.findUserByEmail.mockResolvedValue(null);

    await service.createWorkspace({
      name: 'Acme',
      slug: 'acme',
    });

    expect(signInUpService.signUpOnNewWorkspace).toHaveBeenCalledWith(
      {
        type: 'newUserWithPicture',
        newUserWithPicture: {
          email: 'twenty-workspace-provisioning@regie.ai',
          firstName: 'Regie',
          lastName: 'Provisioning',
          isEmailVerified: true,
        },
      },
      {
        displayName: 'Acme',
        subdomain: 'acme',
        shouldBypassWorkspaceCreationChecks: true,
      },
    );
  });

  it('rejects missing workspace creation fields', async () => {
    const { service } = makeService();

    await expect(
      service.createWorkspace({
        name: ' ',
        slug: 'acme',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('activates an existing workspace with the service user', async () => {
    const { service, userService, workspaceService } = makeService();

    const result = await service.activateWorkspace(workspace.id);

    expect(userService.findUserByEmail).toHaveBeenCalledWith(
      'twenty-workspace-provisioning@regie.ai',
    );
    expect(workspaceService.findOneWorkspaceById).toHaveBeenCalledWith(
      workspace.id,
    );
    expect(workspaceService.activateWorkspace).toHaveBeenCalledWith(
      flatUser,
      workspace,
    );
    expect(result.workspaceId).toBe(workspace.id);
  });

  it('throws when activating a missing workspace', async () => {
    const { service, workspaceService } = makeService();

    workspaceService.findOneWorkspaceById.mockResolvedValue(null);

    await expect(service.activateWorkspace(workspace.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates a workspace admin API key', async () => {
    const { service, apiKeyService, workspaceService } = makeService();

    const result = await service.createWorkspaceApiKey(workspace.id, {
      name: ' regie-crm-api ',
      expiresAt: '2030-01-01T00:00:00.000Z',
    });

    expect(workspaceService.findOneWorkspaceById).toHaveBeenCalledWith(
      workspace.id,
    );
    expect(apiKeyService.createWorkspaceAdminApiKeyToken).toHaveBeenCalledWith({
      workspaceId: workspace.id,
      name: 'regie-crm-api',
      expiresAt: '2030-01-01T00:00:00.000Z',
    });
    expect(result).toEqual({
      ok: true,
      workspaceId: workspace.id,
      apiKey: 'api-key-token',
      apiKeyId: 'api-key-id',
    });
  });
});
