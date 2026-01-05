import { z } from 'zod';

import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

export const LOAD_SKILL_TOOL_NAME = 'load_skill';

export const loadSkillInputSchema = z.object({
  skillNames: z
    .array(z.string())
    .describe(
      'Names of the skills to load (e.g., ["workflow-building", "data-manipulation"])',
    ),
});

export type LoadSkillInput = z.infer<typeof loadSkillInputSchema>;

export type LoadSkillResult = {
  skills: Array<{
    name: string;
    label: string;
    content: string;
  }>;
  message: string;
};

export type LoadSkillFunction = (names: string[]) => Promise<FlatSkill[]>;

export const createLoadSkillTool = (loadSkills: LoadSkillFunction) => ({
  description:
    'Load specialized skills/expertise by name. Returns detailed instructions for workflows, data manipulation, dashboards, metadata, or research.',
  inputSchema: loadSkillInputSchema,
  execute: async (parameters: LoadSkillInput): Promise<LoadSkillResult> => {
    const { skillNames } = parameters;

    const skills = await loadSkills(skillNames);

    if (skills.length === 0) {
      return {
        skills: [],
        message: `No skills found with names: ${skillNames.join(', ')}. Available skills: workflow-building, data-manipulation, dashboard-building, metadata-building, research, code-interpreter, xlsx, pdf, docx, pptx.`,
      };
    }

    return {
      skills: skills.map((skill) => ({
        name: skill.name,
        label: skill.label,
        content: skill.content,
      })),
      message: `Loaded ${skills.length} skill(s). Follow the instructions in the skill content.`,
    };
  },
});
