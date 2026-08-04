import { Test, type TestingModule } from '@nestjs/testing';

import { OpenRecordIn } from 'twenty-shared/types';

import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceMemberTranspiler } from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const buildWorkspaceMemberEntity = (
  overrides: Partial<WorkspaceMemberWorkspaceEntity> = {},
) =>
  ({
    id: '20202020-0687-4c41-b707-ed1bfca972a7',
    name: { firstName: 'Tim', lastName: 'Apple' },
    userEmail: 'tim@apple.dev',
    colorScheme: 'System',
    openRecordIn: OpenRecordIn.RECORD_PAGE,
    locale: 'en',
    avatarUrl: null,
    timeFormat: 'SYSTEM',
    timeZone: 'system',
    dateFormat: 'SYSTEM',
    calendarStartDay: 0,
    numberFormat: 'SYSTEM',
    ...overrides,
  }) as unknown as WorkspaceMemberWorkspaceEntity;

const userWorkspace = {
  id: '20202020-9e3b-46d4-a556-88b9ddc2b034',
  workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
} as UserWorkspaceEntity;

describe('WorkspaceMemberTranspiler', () => {
  let transpiler: WorkspaceMemberTranspiler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMemberTranspiler,
        {
          provide: FileUrlService,
          useValue: { signFileByIdUrl: jest.fn().mockResolvedValue('') },
        },
      ],
    }).compile();

    transpiler = module.get<WorkspaceMemberTranspiler>(
      WorkspaceMemberTranspiler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should preserve openRecordIn when the workspace member has one', async () => {
    const dto = await transpiler.toWorkspaceMemberDto({
      userWorkspace,
      workspaceMemberEntity: buildWorkspaceMemberEntity(),
      userWorkspaceRoles: [],
    });

    expect(dto.openRecordIn).toBe(OpenRecordIn.RECORD_PAGE);
  });

  it('should fall back to SIDE_PANEL when the workspace has not been upgraded yet', async () => {
    const dto = await transpiler.toWorkspaceMemberDto({
      userWorkspace,
      workspaceMemberEntity: buildWorkspaceMemberEntity({
        openRecordIn: undefined as unknown as string,
      }),
      userWorkspaceRoles: [],
    });

    expect(dto.openRecordIn).toBe(OpenRecordIn.SIDE_PANEL);
  });
});
