import { type FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

export const getFieldBaseFile = ({
  data,
}: {
  data: {
    name: string;
    label: string;
    type: FieldMetadataType;
    objectUniversalIdentifier: string;
    description?: string;
  };
  name: string;
}) => {
  const universalIdentifier = v4();
  const descriptionLine = data.description
    ? `\n  description: '${data.description}',`
    : '';

  return `import { defineField, FieldType } from 'twenty-sdk';

export default defineField({
  universalIdentifier: '${universalIdentifier}',
  name: '${data.name}',
  label: '${data.label}',
  type: FieldMetadataType.${data.type},
  objectUniversalIdentifier: '${data.objectUniversalIdentifier}',${descriptionLine}
});
`;
};
