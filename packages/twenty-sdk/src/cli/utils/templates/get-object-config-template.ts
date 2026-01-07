import { v4 } from 'uuid';

export type ObjectConfigTemplateOptions = {
  universalIdentifier?: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
};

export const getObjectConfigTemplate = ({
  universalIdentifier = v4(),
  nameSingular,
  namePlural,
  labelSingular,
  labelPlural,
  description,
  icon = 'IconBox',
}: ObjectConfigTemplateOptions): string => {
  const descriptionLine = description
    ? `\n  description: '${description}',`
    : '';

  const fieldId = v4();

  return `import { defineObject } from 'twenty-sdk';
import { FieldMetadataType } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: '${universalIdentifier}',
  nameSingular: '${nameSingular}',
  namePlural: '${namePlural}',
  labelSingular: '${labelSingular}',
  labelPlural: '${labelPlural}',${descriptionLine}
  icon: '${icon}',
  fields: [
    {
      universalIdentifier: '${fieldId}',
      type: FieldMetadataType.TEXT,
      label: 'Name',
      description: 'The name of the ${labelSingular.toLowerCase()}',
    },
  ],
});
`;
};
