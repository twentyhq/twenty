import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, IsNull, type Repository } from 'typeorm';

import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';

export type Skill = {
  name: string;
  label: string;
  description: string | null;
  content: string;
};

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
  ) {}

  async getAllSkills(workspaceId: string): Promise<Skill[]> {
    const skills = await this.skillRepository.find({
      where: { workspaceId, deletedAt: IsNull() },
      order: { label: 'ASC' },
    });

    return skills.map((skill) => ({
      name: skill.name,
      label: skill.label,
      description: skill.description,
      content: skill.content,
    }));
  }

  async getSkillByName(
    name: string,
    workspaceId: string,
  ): Promise<Skill | undefined> {
    const skill = await this.skillRepository.findOne({
      where: { name, workspaceId, deletedAt: IsNull() },
    });

    if (!skill) {
      return undefined;
    }

    return {
      name: skill.name,
      label: skill.label,
      description: skill.description,
      content: skill.content,
    };
  }

  async getSkillsByNames(
    names: string[],
    workspaceId: string,
  ): Promise<Skill[]> {
    if (names.length === 0) {
      return [];
    }

    const skills = await this.skillRepository.find({
      where: { name: In(names), workspaceId, deletedAt: IsNull() },
    });

    return skills.map((skill) => ({
      name: skill.name,
      label: skill.label,
      description: skill.description,
      content: skill.content,
    }));
  }
}
