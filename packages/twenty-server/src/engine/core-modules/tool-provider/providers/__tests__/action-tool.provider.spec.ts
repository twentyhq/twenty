import { PermissionFlagType } from 'twenty-shared/constants';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ActionToolProvider } from 'src/engine/core-modules/tool-provider/providers/action-tool.provider';
import { type CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const workspaceId = 'workspace-id';

const buildTool = <TTool>(description: string): TTool =>
  ({
    description,
    inputSchema: {},
    execute: jest.fn(),
  }) as TTool;

const buildProvider = (grantedFlags: PermissionFlagType[]) => {
  const permissionsService = {
    hasToolPermission: jest
      .fn()
      .mockImplementation(async (_config, _workspaceId, flag) =>
        grantedFlags.includes(flag),
      ),
  };

  const codeInterpreterService = { isEnabled: jest.fn().mockReturnValue(true) };
  const i18nService = {
    translateMessage: jest
      .fn()
      .mockImplementation(({ messageId }) => messageId),
  };

  const provider = new ActionToolProvider(
    buildTool('http'),
    buildTool('send email'),
    buildTool('draft email'),
    buildTool('find connected accounts'),
    buildTool('create calendar event'),
    buildTool('search help center'),
    buildTool('create file upload'),
    buildTool('complete file upload'),
    buildTool('code interpreter'),
    buildTool('navigate app'),
    buildTool('extract json paths'),
    buildTool('search output'),
    buildTool('save campaign'),
    codeInterpreterService as unknown as CodeInterpreterService,
    permissionsService as unknown as PermissionsService,
    i18nService as unknown as I18nService,
  );

  return { provider, permissionsService };
};

const getToolNames = async (grantedFlags: PermissionFlagType[]) => {
  const { provider } = buildProvider(grantedFlags);

  const descriptors = await provider.generateDescriptors(
    {
      workspaceId,
      roleId: 'role-id',
      rolePermissionConfig: { unionOf: ['role-id'] },
    } as ToolProviderContext,
    { includeSchemas: false },
  );

  return descriptors.map((descriptor) => descriptor.name);
};

describe('ActionToolProvider', () => {
  it('should expose the file upload tools when the role holds UPLOAD_FILE', async () => {
    const toolNames = await getToolNames([PermissionFlagType.UPLOAD_FILE]);

    expect(toolNames).toContain('create_file_upload');
    expect(toolNames).toContain('complete_file_upload');
  });

  it('should hide the file upload tools when the role lacks UPLOAD_FILE', async () => {
    const toolNames = await getToolNames([PermissionFlagType.SEND_EMAIL_TOOL]);

    expect(toolNames).not.toContain('create_file_upload');
    expect(toolNames).not.toContain('complete_file_upload');
    expect(toolNames).toContain('send_email');
  });

  it('should check UPLOAD_FILE against the caller role permission config', async () => {
    const { provider, permissionsService } = buildProvider([
      PermissionFlagType.UPLOAD_FILE,
    ]);
    const rolePermissionConfig = { unionOf: ['role-id'] };

    await provider.generateDescriptors(
      {
        workspaceId,
        roleId: 'role-id',
        rolePermissionConfig,
      } as ToolProviderContext,
      { includeSchemas: false },
    );

    expect(permissionsService.hasToolPermission).toHaveBeenCalledWith(
      rolePermissionConfig,
      workspaceId,
      PermissionFlagType.UPLOAD_FILE,
    );
  });

  it('should always expose the ungated tools', async () => {
    const toolNames = await getToolNames([]);

    expect(toolNames).toEqual(
      expect.arrayContaining([
        'search_help_center',
        'navigate_app',
        'save_campaign',
      ]),
    );
    expect(toolNames).not.toContain('http_request');
    expect(toolNames).not.toContain('send_email');
  });
});
