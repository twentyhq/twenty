import { Test, type TestingModule } from '@nestjs/testing';

import { McpInstructionBuilderService } from 'src/engine/api/mcp/services/mcp-instruction-builder.service';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Uses the real instruction builder, not a mock: the point is to catch a regression
// where handleInitialize stops forwarding the workspace itself.
describe('McpProtocolService initialize instructions', () => {
  let service: McpProtocolService;

  const buildWorkspace = (aiAdditionalInstructions: string | null) =>
    ({
      id: 'workspace-1',
      aiAdditionalInstructions,
    }) as FlatWorkspace;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpProtocolService,
        McpInstructionBuilderService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: {
                byUniversalIdentifier: {
                  'company-uid': {
                    isActive: true,
                    universalIdentifier: 'company-uid',
                    namePlural: 'companies',
                  },
                },
              },
            }),
          },
        },
        {
          provide: SkillService,
          useValue: { findAllFlatSkills: jest.fn().mockResolvedValue([]) },
        },
        { provide: ToolRegistryService, useValue: {} },
        { provide: UserRoleService, useValue: {} },
        { provide: McpToolExecutorService, useValue: {} },
        { provide: ApiKeyRoleService, useValue: {} },
        { provide: WorkspaceCacheService, useValue: {} },
      ],
    }).compile();

    service = module.get<McpProtocolService>(McpProtocolService);
  });

  it('should expose the workspace ai instructions on initialize', async () => {
    const response = await service.handleMCPCoreQuery(
      { jsonrpc: '2.0', method: 'initialize', id: '1' },
      {
        workspace: buildWorkspace('Never delete a company.'),
        apiKey: undefined,
      },
    );

    const instructions = (response?.result as { instructions: string })
      .instructions;

    expect(instructions).toContain('## Workspace Instructions');
    expect(instructions).toContain('Never delete a company.');
  });

  it('should render rich text instructions as markdown rather than raw json', async () => {
    const response = await service.handleMCPCoreQuery(
      { jsonrpc: '2.0', method: 'initialize', id: '1' },
      {
        workspace: buildWorkspace(
          JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Always set an assignee.' }],
              },
            ],
          }),
        ),
        apiKey: undefined,
      },
    );

    const instructions = (response?.result as { instructions: string })
      .instructions;

    expect(instructions).toContain('Always set an assignee.');
    expect(instructions).not.toContain('"type":"doc"');
  });

  it('should omit the section when the workspace has no instructions', async () => {
    const response = await service.handleMCPCoreQuery(
      { jsonrpc: '2.0', method: 'initialize', id: '1' },
      { workspace: buildWorkspace(null), apiKey: undefined },
    );

    const instructions = (response?.result as { instructions: string })
      .instructions;

    expect(instructions).toContain('Available objects: companies.');
    expect(instructions).not.toContain('## Workspace Instructions');
  });
});
