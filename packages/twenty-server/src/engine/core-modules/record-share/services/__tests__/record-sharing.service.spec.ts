import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  MetadataReadability,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';

const MEMBER_ID = '20202020-0000-4000-8000-000000000003';
const ROLE_ID = '20202020-0000-4000-8000-000000000004';
const args = {
  objectMetadataId: 'object',
  recordId: 'record',
  authContext: {
    type: 'user',
    workspaceMemberId: MEMBER_ID,
    workspace: { id: '20202020-0000-4000-8000-000000000001' },
    userWorkspaceId: 'writer',
  } as never,
};
const change = {
  ...args,
  principal: { everyone: true },
  accessLevel: RecordShareAccessLevel.READ,
  enabled: true,
};

const buildService = () => {
  const objectMetadata = {
    id: 'object',
    nameSingular: 'note',
    readability: MetadataReadability.PRIVATE,
  };
  const maps = {
    userWorkspaceRoleMap: { writer: ROLE_ID },
    apiKeyRoleMap: {},
    flatObjectMetadataMaps: {
      universalIdentifierById: { object: 'object' },
      byUniversalIdentifier: { object: objectMetadata },
    },
    flatWorkspaceMemberMaps: {
      byId: { [MEMBER_ID]: { id: MEMBER_ID, deletedAt: null } },
    },
    flatRoleMaps: {
      universalIdentifierById: { [ROLE_ID]: 'role' },
      byUniversalIdentifier: {
        role: { id: ROLE_ID, label: 'Sales', canBeAssignedToUsers: true },
      },
    },
  };
  const cache = { getOrRecompute: jest.fn().mockResolvedValue(maps) };
  const allowed = new Set(['select', 'update']);
  const repository = {
    findRecordIdsAllowedForOperation: jest
      .fn()
      .mockImplementation(async ({ operationType, recordIds }) =>
        allowed.has(operationType) ? recordIds : [],
      ),
  };
  const scope = {
    workspaceId: '20202020-0000-4000-8000-000000000001',
    getRepository: () => repository,
    executeRawQuery: jest.fn().mockResolvedValue([{ id: 'record' }]),
  };
  const manager = {
    getRepositoryWithContextPermissions: () => repository,
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation(async (work: () => Promise<unknown>) => work()),
    runInWorkspaceTransaction: jest
      .fn()
      .mockImplementation(async (work: (scope: unknown) => Promise<unknown>) =>
        work(scope),
      ),
  };
  const grant = {
    principalId: MEMBER_ID,
    principalType: 'WORKSPACE_MEMBER',
    accessLevel: RecordShareAccessLevel.FULL,
    rowCause: 'MANUAL',
  };
  const shares = {
    findByRecordIds: jest.fn().mockResolvedValue([grant]),
    setManualShare: jest.fn(),
  };
  const feature = { isRecordSharingEnabled: jest.fn().mockResolvedValue(true) };
  const service = new RecordSharingService(
    manager as never,
    cache as never,
    shares as never,
    feature as never,
  );
  return {
    service,
    grant,
    objectMetadata,
    maps,
    repository,
    allowed,
    shares,
    scope,
    feature,
  };
};

describe('Generic record sharing', () => {
  it('returns distinct operation capabilities from ordinary record policy', async () => {
    const { service } = buildService();
    await expect(service.getPermissions(args)).resolves.toEqual({
      canRead: true,
      canUpdate: true,
      canDelete: false,
      canSoftDelete: false,
    });
  });

  it('does not expose the audience to read-only recipients', async () => {
    const { service, allowed, shares } = buildService();
    allowed.delete('update');
    await expect(service.getSharing(args)).resolves.toMatchObject({
      isEnabled: true,
      shares: [],
      roles: [],
      permissions: { canUpdate: false },
    });
    await expect(service.setShare(change)).rejects.toThrow('Record not found');
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it('keeps labels for existing application roles without offering unrelated application roles', async () => {
    const { service, maps, shares, grant } = buildService();
    maps.flatRoleMaps.byUniversalIdentifier.role.canBeAssignedToUsers = false;
    expect((await service.getSharing(args)).roles).toEqual([]);
    shares.findByRecordIds.mockResolvedValue([
      grant,
      { principalType: 'ROLE', principalId: ROLE_ID, rowCause: 'APPLICATION' },
    ]);
    expect((await service.getSharing(args)).roles).toEqual([
      { id: ROLE_ID, label: 'Sales' },
    ]);
  });

  it('does not reveal records outside the authenticated workspace', async () => {
    const { service } = buildService();
    await expect(
      service.getSharing({ ...args, objectMetadataId: 'foreign-object' }),
    ).rejects.toThrow('Record not found');
    await expect(
      service.setShare({ ...change, objectMetadataId: 'foreign-object' }),
    ).rejects.toThrow('Record not found');
  });

  it.each([
    { everyone: true },
    { workspaceMemberId: MEMBER_ID },
    { roleId: ROLE_ID },
  ])(
    'lets a FULL holder manage %j without a separate ownership check',
    async (principal) => {
      const { service, shares, scope } = buildService();
      await service.setShare({ ...change, principal });
      expect(shares.setManualShare).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionScope: scope,
          workspaceId: '20202020-0000-4000-8000-000000000001',
          enabled: true,
          share: expect.objectContaining({
            objectMetadataId: 'object',
            recordId: 'record',
            accessLevel: 'READ',
          }),
        }),
      );
      expect(scope.executeRawQuery).toHaveBeenCalledWith(
        expect.stringContaining('FOR UPDATE'),
        ['record'],
      );
    },
  );

  it.each(Object.values(RecordShareAccessLevel))(
    'allows a FULL holder to grant %s within the authorization transaction',
    async (accessLevel) => {
      const { service, shares, scope } = buildService();
      await service.setShare({ ...change, accessLevel });
      expect(shares.setManualShare).toHaveBeenCalledWith(
        expect.objectContaining({
          share: expect.objectContaining({ accessLevel }),
        }),
      );
      expect(shares.findByRecordIds).toHaveBeenCalledWith(
        expect.objectContaining({ transactionScope: scope }),
      );
    },
  );

  it.each([RecordShareAccessLevel.READ, RecordShareAccessLevel.READ_WRITE])(
    'hides the audience and denies all grant mutations for %s even with update permission',
    async (accessLevel) => {
      const { service, shares, grant } = buildService();
      grant.accessLevel = accessLevel;
      await expect(service.getSharing(args)).resolves.toMatchObject({
        viewerAccessLevel: accessLevel,
        permissions: { canUpdate: true },
        shares: [],
        roles: [],
      });
      for (const enabled of [true, false]) {
        for (const requestedLevel of Object.values(RecordShareAccessLevel)) {
          await expect(
            service.setShare({
              ...change,
              enabled,
              accessLevel: requestedLevel,
            }),
          ).rejects.toThrow('Record not found');
        }
      }
      expect(shares.setManualShare).not.toHaveBeenCalled();
    },
  );

  it.each([MEMBER_ID, ROLE_ID, EVERYONE_PRINCIPAL_ID])(
    'resolves FULL from the existing member, role or everyone principal %s',
    async (principalId) => {
      const { service, grant } = buildService();
      grant.principalId = principalId;
      await expect(service.setShare(change)).resolves.toMatchObject({
        viewerAccessLevel: RecordShareAccessLevel.FULL,
      });
    },
  );

  it('does not use another principal’s FULL grant to authorize an editor', async () => {
    const { service, shares, grant } = buildService();
    grant.accessLevel = RecordShareAccessLevel.READ_WRITE;
    shares.findByRecordIds.mockResolvedValue([
      grant,
      {
        ...grant,
        principalId: 'another-member',
        accessLevel: RecordShareAccessLevel.FULL,
      },
    ]);
    await expect(service.setShare(change)).rejects.toThrow('Record not found');
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it.each([
    MetadataReadability.SYSTEM,
    MetadataReadability.APPLICATION,
    MetadataReadability.OPEN,
  ])('does not manage grants on %s objects', async (readability) => {
    const { service, objectMetadata, shares } = buildService();
    objectMetadata.readability = readability;
    await expect(service.getSharing(args)).resolves.toMatchObject({
      isEnabled: false,
    });
    await expect(service.setShare(change)).rejects.toThrow('Record not found');
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it('explains inherited access for objects with parent permissions', async () => {
    const { service, objectMetadata } = buildService();
    objectMetadata.readability = MetadataReadability.INHERITED;
    await expect(service.getSharing(args)).resolves.toMatchObject({
      isEnabled: true,
      hasInheritedAccess: true,
    });
  });

  it('does not turn inherited edit access into permission to manage direct grants', async () => {
    const { service, objectMetadata, shares } = buildService();
    objectMetadata.readability = MetadataReadability.INHERITED;
    shares.findByRecordIds.mockResolvedValue([]);
    await expect(service.getSharing(args)).resolves.toMatchObject({
      viewerAccessLevel: null,
      permissions: { canUpdate: true },
      hasInheritedAccess: true,
      shares: [],
      roles: [],
    });
    await expect(service.setShare(change)).rejects.toThrow('Record not found');
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it('denies nonexistent or unreadable records without exposing audience data', async () => {
    const { service, allowed, shares } = buildService();
    allowed.clear();
    await expect(service.getSharing(args)).rejects.toThrow('Record not found');
    await expect(service.setShare(change)).rejects.toThrow('Record not found');
    expect(shares.findByRecordIds).not.toHaveBeenCalled();
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it('allows revocation with the flag disabled and a removed recipient', async () => {
    const { service, feature, shares } = buildService();
    feature.isRecordSharingEnabled.mockResolvedValue(false);
    await expect(service.setShare(change)).rejects.toThrow(
      'Sharing is unavailable',
    );
    await service.setShare({
      ...change,
      principal: { workspaceMemberId: ROLE_ID },
      enabled: false,
    });
    expect(shares.setManualShare).toHaveBeenCalledTimes(1);
  });

  it('rejects ambiguous and cross-workspace recipients', async () => {
    const { service, shares } = buildService();
    for (const principal of [
      { everyone: true, roleId: ROLE_ID },
      { workspaceMemberId: ROLE_ID },
    ]) {
      await expect(
        service.setShare({ ...change, principal }),
      ).rejects.toMatchObject({ code: 'INVALID_SHARE_WITH' });
    }
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it('successfully redacts the response after a writer revokes their own access', async () => {
    const { service, shares, allowed } = buildService();
    shares.setManualShare.mockImplementation(async () => allowed.clear());
    await expect(
      service.setShare({
        ...change,
        principal: { workspaceMemberId: MEMBER_ID },
        enabled: false,
      }),
    ).resolves.toEqual({
      viewerAccessLevel: null,
      permissions: {
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canSoftDelete: false,
      },
      isEnabled: false,
      hasInheritedAccess: false,
      roles: [],
      shares: [],
    });
  });

  it('propagates storage failures without returning a successful save', async () => {
    const { service, shares } = buildService();
    shares.setManualShare.mockRejectedValue(new Error('Transaction failed'));
    await expect(service.setShare(change)).rejects.toThrow(
      'Transaction failed',
    );
  });
});
