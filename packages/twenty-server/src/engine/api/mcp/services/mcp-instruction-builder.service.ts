import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { camelToSnakeCase, isNonEmptyString } from 'twenty-shared/utils';

import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';
import { tipTapDocumentToMarkdown } from 'src/engine/metadata-modules/ai/ai-chat/utils/tip-tap-document-to-markdown.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

@Injectable()
export class McpInstructionBuilderService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly skillService: SkillService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async buildInstructions(workspaceId: string): Promise<string> {
    const [{ flatObjectMetadataMaps }, allSkills, workspace] =
      await Promise.all([
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        }),
        this.skillService.findAllFlatSkills(workspaceId),
        this.workspaceRepository.findOne({
          where: { id: workspaceId },
          select: { id: true, aiAdditionalInstructions: true },
        }),
      ]);

    const objectNames = getDatabaseCrudToolFlatObjects(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .map((obj) => camelToSnakeCase(obj.namePlural))
      .sort()
      .join(', ');

    const skillNames =
      allSkills.length > 0
        ? allSkills.map((skill) => skill.name).join(', ')
        : undefined;

    const workspaceInstructions = tipTapDocumentToMarkdown(
      workspace?.aiAdditionalInstructions ?? '',
    ).trim();

    return buildMcpServerInstructions(
      objectNames,
      skillNames,
      isNonEmptyString(workspaceInstructions) ? workspaceInstructions : undefined,
    );
  }
}
