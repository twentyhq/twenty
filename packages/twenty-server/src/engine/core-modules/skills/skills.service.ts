import { Injectable } from '@nestjs/common';

import { SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';
import { CODE_INTERPRETER_SKILL } from 'src/engine/core-modules/skills/skills/code-interpreter.skill';
import { DASHBOARD_BUILDING_SKILL } from 'src/engine/core-modules/skills/skills/dashboard-building.skill';
import { DATA_MANIPULATION_SKILL } from 'src/engine/core-modules/skills/skills/data-manipulation.skill';
import { DOCX_SKILL } from 'src/engine/core-modules/skills/skills/docx.skill';
import { METADATA_BUILDING_SKILL } from 'src/engine/core-modules/skills/skills/metadata-building.skill';
import { PDF_SKILL } from 'src/engine/core-modules/skills/skills/pdf.skill';
import { PPTX_SKILL } from 'src/engine/core-modules/skills/skills/pptx.skill';
import { RESEARCH_SKILL } from 'src/engine/core-modules/skills/skills/research.skill';
import { WORKFLOW_BUILDING_SKILL } from 'src/engine/core-modules/skills/skills/workflow-building.skill';
import { XLSX_SKILL } from 'src/engine/core-modules/skills/skills/xlsx.skill';

const SKILL_DEFINITIONS: SkillDefinition[] = [
  WORKFLOW_BUILDING_SKILL,
  DATA_MANIPULATION_SKILL,
  DASHBOARD_BUILDING_SKILL,
  METADATA_BUILDING_SKILL,
  RESEARCH_SKILL,
  CODE_INTERPRETER_SKILL,
  XLSX_SKILL,
  PDF_SKILL,
  DOCX_SKILL,
  PPTX_SKILL,
];

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
