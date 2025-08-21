import { Test } from '@nestjs/testing';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

const createMockToolRegistry = () => ({
  getAllToolTypes: jest.fn(),
  getTool: jest.fn(),
});

const createMockPermissions = () => ({
  hasToolPermission: jest.fn<
    Promise<boolean>,
    [string, string, PermissionFlagType]
  >(),
});

describe('ToolAdapterService', () => {
  let mockRegistry: ReturnType<typeof createMockToolRegistry>;
  let mockPermissions: ReturnType<typeof createMockPermissions>;
  let service: ToolAdapterService;

  // Shared tools
  const unflaggedToolExecute = jest.fn(async (input: ToolInput) => ({
    result: { echoed: input },
  }));
  const unflaggedTool: Tool = {
    description: 'HTTP Request tool',
    parameters: { type: 'object', properties: {} },
    execute: unflaggedToolExecute,
  };

  const flaggedToolExecute = jest.fn(async (input: ToolInput) => ({
    result: { sent: input },
  }));
  const flaggedTool: Tool = {
    description: 'Send Email tool',
    parameters: { type: 'object', properties: {} },
    execute: flaggedToolExecute,
    flag: PermissionFlagType.SEND_EMAIL_TOOL,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRegistry = createMockToolRegistry();
    mockPermissions = createMockPermissions();

    // Setup mock tool responses
    mockRegistry.getAllToolTypes.mockReturnValue([
      ToolType.HTTP_REQUEST,
      ToolType.SEND_EMAIL,
    ]);
    mockRegistry.getTool.mockImplementation((type: ToolType) => {
      if (type === ToolType.HTTP_REQUEST) return unflaggedTool;
      if (type === ToolType.SEND_EMAIL) return flaggedTool;
      throw new Error('Tool not found in mock');
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        ToolAdapterService,
        {
          provide: ToolRegistryService,
          useValue: mockRegistry,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissions,
        },
      ],
    }).compile();

    service = moduleRef.get(ToolAdapterService);
  });

  it('should include unflagged tools regardless of role/workspace', async () => {
    const toolsNoContext = await service.getTools();

    expect(Object.keys(toolsNoContext)).toContain('http_request');

    const toolsWithPartialContext = await service.getTools('role-1');

    expect(Object.keys(toolsWithPartialContext)).toContain('http_request');
  });

  it('should not include flagged tools when role/workspace are missing', async () => {
    const toolsNoContext = await service.getTools();

    expect(Object.keys(toolsNoContext)).not.toContain('send_email');

    const toolsRoleOnly = await service.getTools('role-1');

    expect(Object.keys(toolsRoleOnly)).not.toContain('send_email');

    const toolsWorkspaceOnly = await service.getTools(undefined, 'ws-1');

    expect(Object.keys(toolsWorkspaceOnly)).not.toContain('send_email');
  });

  it('should include flagged tools when permission is granted', async () => {
    mockPermissions.hasToolPermission.mockResolvedValueOnce(true);

    const tools = await service.getTools('role-1', 'ws-1');

    expect(mockPermissions.hasToolPermission).toHaveBeenCalledWith(
      'role-1',
      'ws-1',
      PermissionFlagType.SEND_EMAIL_TOOL,
    );

    expect(Object.keys(tools)).toContain('send_email');
  });

  it('should exclude flagged tools when permission is denied', async () => {
    mockPermissions.hasToolPermission.mockResolvedValueOnce(false);

    const tools = await service.getTools('role-1', 'ws-1');

    expect(Object.keys(tools)).not.toContain('send_email');
  });

  it('should lowercase tool type keys in the returned ToolSet', async () => {
    const tools = await service.getTools();

    const keys = Object.keys(tools);

    expect(keys).toContain('http_request');
    expect(keys).not.toContain(ToolType.HTTP_REQUEST); // ensure enum raw value not used as-is
  });

  it('should forward execute input correctly and return underlying result', async () => {
    const tools = await service.getTools();

    const input = { url: 'https://example.com', method: 'GET' } as ToolInput;
    const result = await tools['http_request'].execute?.(
      { input },
      {
        toolCallId: 'test-tool-call-id',
        messages: [
          {
            role: 'user',
            content: 'content',
          },
        ],
      },
    );

    // Ensure wrapper forwards only parameters.input
    expect(unflaggedToolExecute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ result: { echoed: input } });
  });
});
