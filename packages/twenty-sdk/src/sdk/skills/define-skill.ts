import z from 'zod';

import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type SkillManifest } from 'twenty-shared/application';

const skillManifestSchema = z.object({
  universalIdentifier: z
    .string()
    .min(1, 'Skill must have a universalIdentifier'),
  name: z.string().min(1, 'Skill must have a name'),
  label: z.string().min(1, 'Skill must have a label'),
  content: z.string().min(1, 'Skill must have content'),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const defineSkill: DefineEntity<SkillManifest> = (config) => {
  const result = skillManifestSchema.safeParse(config);

  const errors = result.success
    ? []
    : result.error.issues.map((issue) => issue.message);

  return createValidationResult({ config, errors });
};
