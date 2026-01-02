import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

export type Skill = {
  name: string;
  label: string;
  description: string | null;
  content: string;
};

const fromFlatSkillToSkill = (flatSkill: FlatSkill): Skill => ({
  name: flatSkill.name,
  label: flatSkill.label,
  description: flatSkill.description,
  content: flatSkill.content,
});

@Injectable()
export class SkillsService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getAllSkills(workspaceId: string): Promise<Skill[]> {
    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return Object.values(flatSkillMaps.byId)
      .filter(isDefined)
      .map(fromFlatSkillToSkill)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  async getSkillByName(
    name: string,
    workspaceId: string,
  ): Promise<Skill | undefined> {
    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    const flatSkill = Object.values(flatSkillMaps.byId)
      .filter(isDefined)
      .find((skill) => skill.name === name);

    if (!flatSkill) {
      return undefined;
    }

    return fromFlatSkillToSkill(flatSkill);
  }

  async getSkillsByNames(
    names: string[],
    workspaceId: string,
  ): Promise<Skill[]> {
    if (names.length === 0) {
      return [];
    }

    const { flatSkillMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatSkillMaps'],
        },
      );

    return Object.values(flatSkillMaps.byId)
      .filter(isDefined)
      .filter((skill) => names.includes(skill.name))
      .map(fromFlatSkillToSkill);
  }
}
