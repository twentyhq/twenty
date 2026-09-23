import { Test, type TestingModule } from '@nestjs/testing';

import { ToolCategory } from 'twenty-shared/ai';

import { McpInstructionBuilderService } from 'src/engine/api/mcp/services/mcp-instruction-builder.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

const buildCrudEntry = (
  operation: string,
  objectName: string,
  nameSegment: string,
): ToolIndexEntry =>
  ({
    name: `${operation}_${nameSegment}`,
    label: operation,
    description: operation,
    category: ToolCategory.DATABASE_CRUD,
    objectName,
    operation,
  }) as ToolIndexEntry;

const buildEntry = (name: string, category: ToolCategory): ToolIndexEntry =>
  ({ name, label: name, description: name, category }) as ToolIndexEntry;

describe('McpInstructionBuilderService', () => {
  let service: McpInstructionBuilderService;
  let buildToolIndex: jest.Mock;

  const buildService = async (entries: ToolIndexEntry[]) => {
    buildToolIndex = jest.fn().mockResolvedValue(entries);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpInstructionBuilderService,
        {
          provide: ToolRegistryService,
          useValue: { buildToolIndex },
        },
        {
          provide: SkillService,
          useValue: { findAllFlatSkills: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = module.get(McpInstructionBuilderService);

    return service.buildInstructions({
      workspaceId: 'workspace-id',
      roleId: 'role-id',
      rolePermissionConfig: {} as RolePermissionConfig,
    });
  };

  it('advertises categories the hardcoded list used to omit', async () => {
    const instructions = await buildService([
      buildEntry('list_roles', ToolCategory.ROLE),
      buildEntry('create_dashboard', ToolCategory.DASHBOARD),
      buildEntry('send_email', ToolCategory.ACTION),
    ]);

    expect(instructions).toContain(`  ${ToolCategory.ROLE}: list_roles`);
    expect(instructions).toContain(
      `  ${ToolCategory.DASHBOARD}: create_dashboard`,
    );
    expect(instructions).toContain(`  ${ToolCategory.ACTION}: send_email`);
  });

  it('derives the object list from the role-filtered index', async () => {
    const instructions = await buildService([
      buildCrudEntry('find_many', 'person', 'people'),
      buildCrudEntry('create_one', 'person', 'person'),
      buildCrudEntry('find_many', 'company', 'companies'),
      buildCrudEntry('create_one', 'company', 'company'),
    ]);

    expect(buildToolIndex).toHaveBeenCalledWith(
      'workspace-id',
      'role-id',
      expect.objectContaining({ excludeTools: expect.any(Set) }),
    );
    expect(instructions).toContain('Available objects: companies, people.');
    expect(instructions).not.toContain('Read-only objects');
  });

  it('names the objects that expose no write operation', async () => {
    const instructions = await buildService([
      buildCrudEntry('find_many', 'person', 'people'),
      buildCrudEntry('create_one', 'person', 'person'),
      buildCrudEntry('find_many', 'workspaceMember', 'workspace_members'),
      buildCrudEntry('delete_one', 'workspaceMember', 'workspace_member'),
    ]);

    expect(instructions).toContain(
      'Read-only objects — only the Read operations above exist for these, no create / update / upsert: workspace_members',
    );
    expect(instructions).toContain(
      'Available objects: people, workspace_members.',
    );
  });

  it('caps a long category list and says how many were omitted', async () => {
    const logicFunctions = Array.from({ length: 45 }, (_, index) =>
      buildEntry(`app_function_${index}`, ToolCategory.LOGIC_FUNCTION),
    );

    const instructions = await buildService(logicFunctions);

    expect(instructions).toContain('app_function_39');
    expect(instructions).not.toContain('app_function_40');
    expect(instructions).toContain(
      `(+5 more, call get_tool_catalog with categories: ['${ToolCategory.LOGIC_FUNCTION}'])`,
    );
  });
});
