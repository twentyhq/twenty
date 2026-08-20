import { Test, type TestingModule } from '@nestjs/testing';

import { McpInstructionBuilderService } from 'src/engine/api/mcp/services/mcp-instruction-builder.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

describe('McpInstructionBuilderService', () => {
  let service: McpInstructionBuilderService;
  let flatEntityMapsCacheService: {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;
  };
  let skillService: { findAllFlatSkills: jest.Mock };

  const buildWorkspace = (aiAdditionalInstructions: string | null) =>
    ({
      id: 'workspace-1',
      aiAdditionalInstructions,
    }) as FlatWorkspace;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
          useValue: {
            findAllFlatSkills: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<McpInstructionBuilderService>(
      McpInstructionBuilderService,
    );
    flatEntityMapsCacheService = module.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
    skillService = module.get(SkillService);
  });

  it('should include the workspace ai instructions', async () => {
    const instructions = await service.buildInstructions(
      buildWorkspace('Always set an assignee and a due date on tasks.'),
    );

    expect(instructions).toContain('## Workspace Instructions');
    expect(instructions).toContain(
      'Always set an assignee and a due date on tasks.',
    );
  });

  it('should omit the workspace instructions section when unset', async () => {
    const instructions = await service.buildInstructions(buildWorkspace(null));

    expect(instructions).toContain('Available objects: companies.');
    expect(instructions).not.toContain('## Workspace Instructions');
  });

  it('should scope its lookups to the given workspace', async () => {
    await service.buildInstructions(buildWorkspace(null));

    expect(
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledTimes(1);
    expect(
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      flatMapsKeys: ['flatObjectMetadataMaps'],
    });
    expect(skillService.findAllFlatSkills).toHaveBeenCalledTimes(1);
    expect(skillService.findAllFlatSkills).toHaveBeenCalledWith('workspace-1');
  });
});
