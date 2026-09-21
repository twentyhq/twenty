import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const THREAD_ID = '20202020-0000-4000-8000-000000000002';
const MEMBER_ID = '20202020-0000-4000-8000-000000000003';
const ROLE_ID = '20202020-0000-4000-8000-000000000004';
const OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000005';
const OWNER_ID = 'owner';
const READER_ID = 'reader';
const args = {
  workspaceId: WORKSPACE_ID,
  threadId: THREAD_ID,
  userWorkspaceId: READER_ID,
};

const buildService = () => {
  const thread = { id: THREAD_ID, userWorkspaceId: OWNER_ID };
  const threadRepository = {
    findOne: jest
      .fn()
      .mockImplementation((_workspaceId, { where }) =>
        where.userWorkspaceId && where.userWorkspaceId !== OWNER_ID
          ? null
          : thread,
      ),
  };
  const userWorkspaceRepository = {
    findOne: jest.fn().mockResolvedValue({ id: READER_ID, userId: 'user' }),
  };
  const shares = {
    findByRecordIds: jest.fn().mockResolvedValue([]),
    findManualReadRecordIdsByPrincipals: jest.fn().mockResolvedValue([]),
    setManualShare: jest.fn(),
  };
  const feature = { isRecordSharingEnabled: jest.fn().mockResolvedValue(true) };
  const permissions = {
    userHasWorkspaceSettingPermission: jest.fn().mockResolvedValue(true),
  };
  const maps = {
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
          id: OBJECT_METADATA_ID,
        },
      },
    },
    flatWorkspaceMemberMaps: {
      idByUserId: { user: MEMBER_ID },
      byId: { [MEMBER_ID]: { id: MEMBER_ID, userWorkspaceId: READER_ID } },
    },
    flatRoleMaps: {
      universalIdentifierById: { [ROLE_ID]: ROLE_ID },
      byUniversalIdentifier: {
        [ROLE_ID]: { id: ROLE_ID, label: 'Sales', canBeAssignedToUsers: true },
      },
    },
    userWorkspaceRoleMap: { [READER_ID]: ROLE_ID },
  };
  const cache = { getOrRecompute: jest.fn().mockResolvedValue(maps) };
  const service = new AgentChatSharingService(
    threadRepository as never,
    userWorkspaceRepository as never,
    shares as never,
    feature as never,
    cache as never,
    permissions as never,
  );
  return {
    service,
    shares,
    threadRepository,
    userWorkspaceRepository,
    feature,
    permissions,
    maps,
    thread,
  };
};

const readShare = (principalId: string) => ({
  principalId,
  recordId: THREAD_ID,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: THREAD_ID,
});

describe('Agent chat sharing', () => {
  it('keeps existing owners able to read without grants or a sharing entitlement', async () => {
    const { service, feature, shares } = buildService();
    feature.isRecordSharingEnabled.mockResolvedValue(false);
    await expect(
      service.getReadableThread({ ...args, userWorkspaceId: OWNER_ID }),
    ).resolves.toMatchObject({ id: THREAD_ID });
    expect(shares.findByRecordIds).not.toHaveBeenCalled();
  });

  it.each([MEMBER_ID, ROLE_ID, EVERYONE_PRINCIPAL_ID])(
    'admits a viewer granted access through %s',
    async (principalId) => {
      const { service, shares } = buildService();
      shares.findByRecordIds.mockResolvedValue([readShare(principalId)]);
      await expect(service.getReadableThread(args)).resolves.toMatchObject({
        id: THREAD_ID,
      });
      expect(shares.findByRecordIds).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        recordIds: [THREAD_ID],
      });
    },
  );

  it.each([
    { rowCause: RecordShareRowCause.APPLICATION },
    { sourceId: 'another-source' },
    { accessLevel: RecordShareAccessLevel.READ_WRITE },
  ])(
    'ignores grants outside the owner-managed sharing dialog: %j',
    async (override) => {
      const { service, shares } = buildService();
      const grant = { ...readShare(MEMBER_ID), ...override };
      shares.findByRecordIds.mockResolvedValue([grant]);
      await expect(service.getReadableThread(args)).rejects.toMatchObject({
        code: 'THREAD_NOT_FOUND',
      });
      await expect(service.getSharedThreadIds(args)).resolves.toEqual([]);
      await expect(
        service.getSharing({ ...args, userWorkspaceId: OWNER_ID }),
      ).resolves.toMatchObject({ shares: [] });
    },
  );

  it('denies a member with no grant and hides whether the thread exists', async () => {
    const { service } = buildService();
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });

  it('denies old grants when sharing is disabled', async () => {
    const { service, feature, shares } = buildService();
    feature.isRecordSharingEnabled.mockResolvedValue(false);
    shares.findByRecordIds.mockResolvedValue([
      readShare(EVERYONE_PRINCIPAL_ID),
    ]);
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
    await expect(service.getSharedThreadIds(args)).resolves.toEqual([]);
  });

  it('rechecks grants on every read so revocation takes effect', async () => {
    const { service, shares } = buildService();
    shares.findByRecordIds
      .mockResolvedValueOnce([readShare(MEMBER_ID)])
      .mockResolvedValue([]);
    await expect(service.getReadableThread(args)).resolves.toBeDefined();
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });

  it('rechecks role membership instead of persisting an expanded member list', async () => {
    const { service, shares, maps } = buildService();
    shares.findByRecordIds.mockResolvedValue([readShare(ROLE_ID)]);
    await expect(service.getReadableThread(args)).resolves.toBeDefined();
    maps.userWorkspaceRoleMap[READER_ID] = 'another-role';
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });

  it('denies removed workspace members even with an everyone grant', async () => {
    const { service, shares, userWorkspaceRepository } = buildService();
    shares.findByRecordIds.mockResolvedValue([
      readShare(EVERYONE_PRINCIPAL_ID),
    ]);
    userWorkspaceRepository.findOne.mockResolvedValue(null);
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
    expect(userWorkspaceRepository.findOne).toHaveBeenCalledWith({
      where: { id: READER_ID, workspaceId: WORKSPACE_ID },
    });
  });

  it('denies readers whose AI permission was revoked', async () => {
    const { service, permissions, shares } = buildService();
    shares.findByRecordIds.mockResolvedValue([
      readShare(EVERYONE_PRINCIPAL_ID),
    ]);
    permissions.userHasWorkspaceSettingPermission.mockResolvedValue(false);
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });

  it('does not expose grants to viewers', async () => {
    const { service, shares } = buildService();
    shares.findByRecordIds.mockResolvedValue([readShare(MEMBER_ID)]);
    await expect(service.getSharing(args)).resolves.toEqual({
      canManage: false,
      roles: [],
      isEnabled: true,
      shares: [],
    });
  });

  it('does not allow viewers to grant access', async () => {
    const { service, shares } = buildService();
    await expect(
      service.setShare({ ...args, target: { everyone: true }, enabled: true }),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it.each([
    { workspaceMemberId: MEMBER_ID },
    { roleId: ROLE_ID },
    { everyone: true },
  ])('allows owners to grant only read access to %j', async (target) => {
    const { service, shares } = buildService();
    await service.setShare({
      ...args,
      userWorkspaceId: OWNER_ID,
      target,
      enabled: true,
    });
    expect(shares.setManualShare).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        enabled: true,
        share: expect.objectContaining({
          recordId: THREAD_ID,
          objectMetadataId: OBJECT_METADATA_ID,
          accessLevel: RecordShareAccessLevel.READ,
          sourceId: THREAD_ID,
        }),
      }),
    );
  });

  it('rejects principals outside the workspace', async () => {
    const { service, shares } = buildService();
    await expect(
      service.setShare({
        ...args,
        userWorkspaceId: OWNER_ID,
        target: { workspaceMemberId: OBJECT_METADATA_ID },
        enabled: true,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_SHARE_WITH' });
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it('rejects ambiguous principal targets', async () => {
    const { service } = buildService();
    await expect(
      service.setShare({
        ...args,
        userWorkspaceId: OWNER_ID,
        target: { everyone: true, roleId: ROLE_ID },
        enabled: true,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_SHARE_WITH' });
  });

  it('allows revocation after entitlement loss or member deletion', async () => {
    const { service, feature, shares } = buildService();
    feature.isRecordSharingEnabled.mockResolvedValue(false);
    await service.setShare({
      ...args,
      userWorkspaceId: OWNER_ID,
      target: { workspaceMemberId: OBJECT_METADATA_ID },
      enabled: false,
    });
    expect(shares.setManualShare).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('lets owners revoke an existing setup-thread grant', async () => {
    const { service, shares } = buildService();
    const threadId = buildWorkspaceSetupChatThreadId({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: OWNER_ID,
    });
    await service.setShare({
      ...args,
      threadId,
      userWorkspaceId: OWNER_ID,
      target: { everyone: true },
      enabled: false,
    });
    expect(shares.setManualShare).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        share: expect.objectContaining({ recordId: threadId }),
      }),
    );
  });

  it('keeps setup history private even if a grant was inserted outside the API', async () => {
    const { service, shares, thread } = buildService();
    thread.id = buildWorkspaceSetupChatThreadId({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: OWNER_ID,
    });
    shares.findByRecordIds.mockResolvedValue([
      { ...readShare(MEMBER_ID), recordId: thread.id, sourceId: thread.id },
    ]);
    await expect(
      service.getReadableThread({ ...args, threadId: thread.id }),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
  });

  it('never shares the privileged workspace setup conversation', async () => {
    const { service, shares } = buildService();
    await expect(
      service.setShare({
        ...args,
        userWorkspaceId: OWNER_ID,
        threadId: buildWorkspaceSetupChatThreadId({
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: OWNER_ID,
        }),
        target: { everyone: true },
        enabled: true,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AGENT_INPUT' });
    expect(shares.setManualShare).not.toHaveBeenCalled();
  });

  it('uses distinct readable IDs from the share repository', async () => {
    const { service, shares } = buildService();
    shares.findManualReadRecordIdsByPrincipals.mockResolvedValue([THREAD_ID]);
    await expect(service.getSharedThreadIds(args)).resolves.toEqual([
      THREAD_ID,
    ]);
  });
});
