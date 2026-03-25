import { type DefineEntity } from '@/sdk/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/common/utils/create-validation-result';
import { type SkillManifest } from 'twenty-shared/application';

export const defineSkill: DefineEntity<SkillManifest> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('Skill must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('Skill must have a name');
  }

  if (!config.label) {
    errors.push('Skill must have a label');
  }

  if (!config.content) {
    errors.push('Skill must have content');
  }

  return createValidationResult({ config, errors });
};
