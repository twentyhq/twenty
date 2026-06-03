import { Injectable } from '@nestjs/common';

import { camelToSnakeCase, isDefined } from 'twenty-shared/utils';

import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

@Injectable()
export class McpInstructionBuilderService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly skillService: SkillService,
  ) {}

  async buildInstructions(workspaceId: string): Promise<string> {
    const [{ flatObjectMetadataMaps }, allSkills] = await Promise.all([
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps'],
      }),
      this.skillService.findAllFlatSkills(workspaceId),
    ]);

    const objectNames = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((obj) => obj.isActive && !isWorkflowRelatedObject(obj))
      .map((obj) => camelToSnakeCase(obj.namePlural))
      .sort()
      .join(', ');

    const skillNames =
      allSkills.length > 0
        ? allSkills.map((skill) => skill.name).join(', ')
        : undefined;

    return buildMcpServerInstructions(objectNames, skillNames);
  }
}
