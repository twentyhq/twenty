import { isDefined } from 'twenty-shared/utils';
import { type FindOneSkillQuery } from '~/generated-metadata/graphql';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabel';
import { type SettingsSkillFormValues } from '~/pages/settings/ai/types/SettingsSkillFormValues';

export const getSettingsSkillInitialFormValues = (
  skill?: FindOneSkillQuery['skill'],
): SettingsSkillFormValues => {
  if (!isDefined(skill)) {
    return {
      name: '',
      label: '',
      description: '',
      content: '',
      icon: 'IconBook',
      isLabelSyncedWithName: true,
    };
  }

  return {
    name: skill.name,
    label: skill.label,
    description: skill.description ?? '',
    content: skill.content,
    icon: skill.icon ?? 'IconBook',
    isLabelSyncedWithName:
      skill.name === computeMetadataNameFromLabel(skill.label),
  };
};
