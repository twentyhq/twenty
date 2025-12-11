import { Injectable } from '@nestjs/common';

import { SKILL_DEFINITIONS } from './skill-definitions';

export type Skill = {
  name: string;
  label: string;
  description: string;
  content: string;
};

@Injectable()
export class SkillsService {
  getAllSkills(): Skill[] {
    return SKILL_DEFINITIONS.map((skill) => ({
      name: skill.name,
      label: skill.label,
      description: skill.description,
      content: skill.content,
    }));
  }

  getSkillByName(name: string): Skill | undefined {
    const skillDef = SKILL_DEFINITIONS.find((skill) => skill.name === name);

    if (!skillDef) {
      return undefined;
    }

    return {
      name: skillDef.name,
      label: skillDef.label,
      description: skillDef.description,
      content: skillDef.content,
    };
  }

  getSkillsByNames(names: string[]): Skill[] {
    return names
      .map((name) => this.getSkillByName(name))
      .filter((skill): skill is Skill => skill !== undefined);
  }
}
