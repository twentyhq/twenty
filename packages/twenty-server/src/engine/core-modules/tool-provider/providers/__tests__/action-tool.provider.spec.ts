import { Test } from '@nestjs/testing';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { CreateCalendarEventTool } from 'src/engine/core-modules/tool/tools/calendar-tool/create-calendar-event-tool';
import { CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { FindConnectedAccountsTool } from 'src/engine/core-modules/tool/tools/email-tool/find-connected-accounts-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { CompleteFileUploadTool } from 'src/engine/core-modules/tool/tools/file-upload-tool/complete-file-upload-tool';
import { CreateFileUploadTool } from 'src/engine/core-modules/tool/tools/file-upload-tool/create-file-upload-tool';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { ExtractJsonPathsTool } from 'src/engine/core-modules/tool/tools/output-navigation-tool/extract-json-paths-tool';
import { SearchOutputTool } from 'src/engine/core-modules/tool/tools/output-navigation-tool/search-output-tool';
import { SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { ShareRecordTool } from 'src/engine/core-modules/tool/tools/share-record-tool/share-record-tool';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { SaveCampaignTool } from 'src/modules/emailing/tools/save-campaign-tool';

const WORKSPACE_ID = 'workspace-id';

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as UserWorkspaceAuthContext;

const CONTEXT: ToolProviderContext = {
  workspaceId: WORKSPACE_ID,
  authContext: USER_AUTH_CONTEXT,
  userId: 'user-id',
  userWorkspaceId: 'user-workspace-id',
};

const buildTool = () => ({
  description: 'description',
  inputSchema: {},
  execute: jest.fn().mockResolvedValue({ success: true, message: 'done' }),
});

const buildProvider = async ({
  isRecordSharingEnabled,
}: {
  isRecordSharingEnabled: boolean;
}) => {
  const shareRecordTool = {
    ...buildTool(),
    isEnabled: jest.fn().mockResolvedValue(isRecordSharingEnabled),
  };

  const module = await Test.createTestingModule({
    providers: [
      ActionToolProvider,
      ...[
        HttpTool,
        SendEmailTool,
        DraftEmailTool,
        FindConnectedAccountsTool,
        CreateCalendarEventTool,
        SearchHelpCenterTool,
        CreateFileUploadTool,
        CompleteFileUploadTool,
        CodeInterpreterTool,
        ExtractJsonPathsTool,
        SearchOutputTool,
        SaveCampaignTool,
      ].map((tool) => ({ provide: tool, useValue: buildTool() })),
      { provide: ShareRecordTool, useValue: shareRecordTool },
      {
        provide: CodeInterpreterService,
        useValue: { isEnabled: () => false },
      },
      {
        provide: PermissionsService,
        useValue: { hasPermissionFlag: jest.fn().mockResolvedValue(false) },
      },
      {
        provide: I18nService,
        useValue: {
          translateMessage: ({ messageId }: { messageId: string }) => messageId,
        },
      },
    ],
  }).compile();

  const provider = module.get(ActionToolProvider);

  return { provider, shareRecordTool };
};

const getToolNames = async (provider: ActionToolProvider) =>
  (await provider.generateDescriptors(CONTEXT, { includeSchemas: false })).map(
    (descriptor) => descriptor.name,
  );

describe('ActionToolProvider', () => {
  it('does not offer or execute the retired navigation tool', async () => {
    const { provider } = await buildProvider({ isRecordSharingEnabled: true });

    expect(await getToolNames(provider)).not.toContain('navigate_app');
    await expect(
      provider.executeStaticTool('navigate_app', {}, CONTEXT),
    ).rejects.toThrow('Unknown action tool "navigate_app"');
  });

  it('lists share_record when record sharing is enabled', async () => {
    const { provider, shareRecordTool } = await buildProvider({
      isRecordSharingEnabled: true,
    });

    expect(await getToolNames(provider)).toContain('share_record');
    expect(shareRecordTool.isEnabled).toHaveBeenCalledWith(WORKSPACE_ID);
  });

  it('hides share_record when record sharing is disabled', async () => {
    const { provider } = await buildProvider({ isRecordSharingEnabled: false });

    expect(await getToolNames(provider)).not.toContain('share_record');
  });

  it('passes the auth context of the caller to share_record', async () => {
    const { provider, shareRecordTool } = await buildProvider({
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
});
