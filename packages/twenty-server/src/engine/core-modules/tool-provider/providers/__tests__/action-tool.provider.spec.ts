import { type CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { type CreateCalendarEventTool } from 'src/engine/core-modules/tool/tools/calendar-tool/create-calendar-event-tool';
import { type CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { type DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { type FindConnectedAccountsTool } from 'src/engine/core-modules/tool/tools/email-tool/find-connected-accounts-tool';
import { type SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { type CompleteFileUploadTool } from 'src/engine/core-modules/tool/tools/file-upload-tool/complete-file-upload-tool';
import { type CreateFileUploadTool } from 'src/engine/core-modules/tool/tools/file-upload-tool/create-file-upload-tool';
import { type HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { type ExtractJsonPathsTool } from 'src/engine/core-modules/tool/tools/output-navigation-tool/extract-json-paths-tool';
import { type SearchOutputTool } from 'src/engine/core-modules/tool/tools/output-navigation-tool/search-output-tool';
import { type SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { type ShareRecordTool } from 'src/engine/core-modules/tool/tools/share-record-tool/share-record-tool';
import { type PermissionsService } from 'src/engine/permissions/permissions.service';
import { type SaveCampaignTool } from 'src/modules/emailing/tools/save-campaign-tool';

const WORKSPACE_ID = 'workspace-id';

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as UserWorkspaceAuthContext;

const CONTEXT: ToolProviderContext = {
  workspaceId: WORKSPACE_ID,
  rolePermissionConfig: { intersectionOf: { userWorkspaceRoleId: 'role-id' } },
  authContext: USER_AUTH_CONTEXT,
  userId: 'user-id',
  userWorkspaceId: 'user-workspace-id',
};

const SCOPED_CONTEXT: ToolProviderContext = {
  ...CONTEXT,
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'role-id' },
    scope: { objectsPermissions: {}, permissionFlags: {} },
  },
};

const buildTool = <TTool>(): TTool =>
  ({
    description: 'description',
    inputSchema: {},
    execute: jest.fn().mockResolvedValue({ success: true, message: 'done' }),
  }) as unknown as TTool;

const buildProvider = ({
  isRecordSharingEnabled,
  arePermissionFlagsGranted = false,
}: {
  isRecordSharingEnabled: boolean;
  arePermissionFlagsGranted?: boolean;
}) => {
  const shareRecordTool = {
    ...buildTool<ShareRecordTool>(),
    isEnabled: jest.fn().mockResolvedValue(isRecordSharingEnabled),
  } as unknown as ShareRecordTool;

  const provider = new ActionToolProvider(
    buildTool<HttpTool>(),
    buildTool<SendEmailTool>(),
    buildTool<DraftEmailTool>(),
    buildTool<FindConnectedAccountsTool>(),
    buildTool<CreateCalendarEventTool>(),
    buildTool<SearchHelpCenterTool>(),
    buildTool<CreateFileUploadTool>(),
    buildTool<CompleteFileUploadTool>(),
    buildTool<CodeInterpreterTool>(),
    buildTool<ExtractJsonPathsTool>(),
    buildTool<SearchOutputTool>(),
    buildTool<SaveCampaignTool>(),
    shareRecordTool,
    { isEnabled: () => true } as unknown as CodeInterpreterService,
    {
      checkRolesPermissions: jest
        .fn()
        .mockResolvedValue(arePermissionFlagsGranted),
    } as unknown as PermissionsService,
    {
      translateMessage: ({ messageId }: { messageId: string }) => messageId,
    } as unknown as I18nService,
  );

  return { provider, shareRecordTool };
};

const getToolNames = async (
  provider: ActionToolProvider,
  context: ToolProviderContext = CONTEXT,
) =>
  (await provider.generateDescriptors(context, { includeSchemas: false })).map(
    (descriptor) => descriptor.name,
  );

describe('ActionToolProvider', () => {
  it('does not offer or execute the retired navigation tool', async () => {
    const { provider } = buildProvider({ isRecordSharingEnabled: true });

    expect(await getToolNames(provider)).not.toContain('navigate_app');
    await expect(
      provider.executeStaticTool('navigate_app', {}, CONTEXT),
    ).rejects.toThrow('Unknown action tool "navigate_app"');
  });

  it('lists share_record when record sharing is enabled', async () => {
    const { provider, shareRecordTool } = buildProvider({
      isRecordSharingEnabled: true,
    });

    expect(await getToolNames(provider)).toContain('share_record');
    expect(shareRecordTool.isEnabled).toHaveBeenCalledWith(WORKSPACE_ID);
  });

  it('hides share_record when record sharing is disabled', async () => {
    const { provider } = buildProvider({ isRecordSharingEnabled: false });

    expect(await getToolNames(provider)).not.toContain('share_record');
  });

  it('passes the auth context of the caller to share_record', async () => {
    const { provider, shareRecordTool } = buildProvider({
      isRecordSharingEnabled: true,
    });
    const args = { objectNameSingular: 'company' };

    await provider.executeStaticTool('share_record', args, CONTEXT);

    expect(shareRecordTool.execute).toHaveBeenCalledWith(
      args,
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        authContext: USER_AUTH_CONTEXT,
      }),
    );
  });

  it('offers code_interpreter to a caller granted it', async () => {
    const { provider } = buildProvider({
      isRecordSharingEnabled: false,
      arePermissionFlagsGranted: true,
    });

    expect(await getToolNames(provider)).toContain('code_interpreter');
  });

  it('withholds the tools that do not honour a scope from a caller narrowed by one, even when granted', async () => {
    const { provider } = buildProvider({
      isRecordSharingEnabled: true,
      arePermissionFlagsGranted: true,
    });

    const toolNames = await getToolNames(provider, SCOPED_CONTEXT);

    expect(toolNames).not.toContain('code_interpreter');
    expect(toolNames).not.toContain('share_record');
    expect(toolNames).toContain('save_campaign');
    expect(toolNames).toContain('http_request');
  });

  it('refuses to run a tool that does not honour the scope of its caller', async () => {
    const { provider, shareRecordTool } = buildProvider({
      isRecordSharingEnabled: true,
      arePermissionFlagsGranted: true,
    });

    expect(
      await provider.executeStaticTool('share_record', {}, SCOPED_CONTEXT),
    ).toMatchObject({ success: false });
    expect(shareRecordTool.execute).not.toHaveBeenCalled();
  });
});
