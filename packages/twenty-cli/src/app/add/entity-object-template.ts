import { randomUUID } from 'node:crypto';

import { printTypescriptValue } from '@/app/pull/print-typescript-value';

export const getObjectBaseFile = ({
  data,
  universalIdentifier = randomUUID(),
  nameFieldUniversalIdentifier = randomUUID(),
}: {
  data: {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
  };
  name: string;
  universalIdentifier?: string;
  nameFieldUniversalIdentifier?: string;
}) => {
  return `import { defineObject, FieldType } from 'twenty-sdk/define';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '${nameFieldUniversalIdentifier}';

export default defineObject({
  universalIdentifier: '${universalIdentifier}',
  nameSingular: ${printTypescriptValue({ value: data.nameSingular })},
  namePlural: ${printTypescriptValue({ value: data.namePlural })},
  labelSingular: ${printTypescriptValue({ value: data.labelSingular })},
  labelPlural: ${printTypescriptValue({ value: data.labelPlural })},
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: ${printTypescriptValue({ value: `Name of the ${data.nameSingular}` })},
      icon: 'IconAbc',
    },
  ],
});
`;
};
