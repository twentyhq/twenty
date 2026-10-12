import { Test, type TestingModule } from '@nestjs/testing';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { ShareRecordTool } from 'src/engine/core-modules/tool/tools/share-record-tool/share-record-tool';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const COMPANY_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000002';
const RECORD_ID = '20202020-0000-4000-8000-000000000003';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000004';
const ROLE_ID = '20202020-0000-4000-8000-000000000005';

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as UserWorkspaceAuthContext;

const FLAT_OBJECT_METADATA_MAPS = {
  byUniversalIdentifier: {
    company: {
      id: COMPANY_OBJECT_METADATA_ID,
      nameSingular: 'company',
      namePlural: 'companies',
    },
  },
};

describe('ShareRecordTool', () => {
  let tool: ShareRecordTool;
  let isFeatureEnabled: jest.Mock;
  let setShare: jest.Mock;

  beforeEach(async () => {
    isFeatureEnabled = jest.fn().mockResolvedValue(true);
    setShare = jest.fn().mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareRecordTool,
        {
          provide: FeatureFlagService,
          useValue: { isFeatureEnabled },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
            }),
          },
        },
        {
          provide: RecordSharingService,
          useValue: { setShare },
        },
      ],
    }).compile();

    tool = module.get(ShareRecordTool);
  });

  const execute = (
    input: Record<string, unknown>,
    authContext: WorkspaceAuthContext | undefined = USER_AUTH_CONTEXT,
  ) =>
    tool.execute(
      { objectNameSingular: 'company', recordId: RECORD_ID, ...input },
      { workspaceId: WORKSPACE_ID, authContext },
    );

  it('shares the record with a workspace member', async () => {
    const result = await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    });

    expect(result.success).toBe(true);
    expect(setShare).toHaveBeenCalledWith({
      objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      recordId: RECORD_ID,
      principal: { workspaceMemberId: WORKSPACE_MEMBER_ID, roleId: undefined },
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      authContext: USER_AUTH_CONTEXT,
    });
  });

  it('defaults to read access when sharing with a role', async () => {
    const result = await execute({ roleId: ROLE_ID });

    expect(result.success).toBe(true);
    expect(setShare).toHaveBeenCalledWith(
      expect.objectContaining({
        principal: { workspaceMemberId: undefined, roleId: ROLE_ID },
        accessLevel: RecordShareAccessLevel.READ,
      }),
    );
  });

  it('treats a null principal as unset', async () => {
    const result = await execute({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      roleId: null,
    });

    expect(result.success).toBe(true);
    expect(setShare).toHaveBeenCalledWith(
      expect.objectContaining({
        principal: {
          workspaceMemberId: WORKSPACE_MEMBER_ID,
          roleId: undefined,
        },
      }),
    );
  });

  it('refuses to share when record sharing is not enabled', async () => {
    isFeatureEnabled.mockResolvedValue(false);

    const result = await execute({ workspaceMemberId: WORKSPACE_MEMBER_ID });

    expect(result.success).toBe(false);
    expect(setShare).not.toHaveBeenCalled();
  });

  it.each([
    [{}],
    [{ workspaceMemberId: null, roleId: null }],
    [{ workspaceMemberId: WORKSPACE_MEMBER_ID, roleId: ROLE_ID }],
    [
      {
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        accessLevel: RecordShareAccessLevel.NONE,
      },
    ],
  ])('rejects invalid input %j', async (input) => {
    const result = await execute(input);

    expect(result.success).toBe(false);
    expect(setShare).not.toHaveBeenCalled();
  });

  it('refuses to share without a user', async () => {
    const result = await execute({ workspaceMemberId: WORKSPACE_MEMBER_ID }, {
      type: 'apiKey',
    } as WorkspaceAuthContext);

    expect(result.success).toBe(false);
    expect(setShare).not.toHaveBeenCalled();
  });

  it('fails on an unknown object', async () => {
    const result = await execute({
      objectNameSingular: 'unknown',
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('unknown');
    expect(setShare).not.toHaveBeenCalled();
  });

  it('reports record sharing errors as a failed output', async () => {
    setShare.mockRejectedValueOnce(
      new RecordShareException(
        'shareWith names a role that does not belong to this workspace',
        RecordShareExceptionCode.INVALID_SHARE_WITH,
      ),
    );

    const result = await execute({ roleId: ROLE_ID });

    expect(result.success).toBe(false);
    expect(result.error).toContain('does not belong to this workspace');
  });

  it('rethrows internal record sharing errors', async () => {
    const internalError = new RecordShareException(
      'Transaction scope mismatch',
      RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH,
    );

    setShare.mockRejectedValueOnce(internalError);

    await expect(execute({ roleId: ROLE_ID })).rejects.toBe(internalError);
  });

  it('reports a record the caller cannot manage as a failed output', async () => {
    setShare.mockRejectedValueOnce(new NotFoundError('Record not found'));

    const result = await execute({ workspaceMemberId: WORKSPACE_MEMBER_ID });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed to manage its sharing');
  });
});
