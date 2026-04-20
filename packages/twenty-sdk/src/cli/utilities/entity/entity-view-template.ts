import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { v4 } from 'uuid';

type ViewFieldTemplate = {
  universalIdentifier?: string;
  fieldMetadataUniversalIdentifier: string;
  position: number;
  isVisible?: boolean;
  size?: number;
};

export const getViewBaseFile = ({
  name,
  universalIdentifier = v4(),
  objectUniversalIdentifier = 'fill-later',
  fields = [],
}: {
  name: string;
  universalIdentifier?: string;
  objectUniversalIdentifier?: string;
  fields?: ViewFieldTemplate[];
}) => {
  const kebabCaseName = kebabCase(name);

  const formattedFields = fields.map((field, index) => {
    const uid = field.universalIdentifier ?? v4();
    return {
      universalIdentifier: uid,
      fieldMetadataUniversalIdentifier: field.fieldMetadataUniversalIdentifier,
      position: field.position ?? index,
      isVisible: field.isVisible ?? true,
      size: field.size ?? 200,
    };
  });

  const defaultFields = `  // fields: [
  //   {
  //     universalIdentifier: '...',
  //     fieldMetadataUniversalIdentifier: '...',
  //     position: 0,
  //     isVisible: true,
  //   },
  // ],`;

  const fieldsBlock =
    fields.length > 0
      ? `  fields: [
  ${formattedFields
    .map((field) => JSON.stringify(field, null, 2))
    .join(',\n')},\n
  ],`
      : defaultFields;

  return `import { defineView } from 'twenty-sdk/define';

export default defineView({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  objectUniversalIdentifier: '${objectUniversalIdentifier}',
  icon: 'IconList',
  position: 0,
${fieldsBlock}
  // filters: [
  //   {
  //     universalIdentifier: '...',
  //     fieldMetadataUniversalIdentifier: '...',
  //     operand: 'Contains',
  //     value: '',
  //   },
  // ],
  // sorts: [
  //   {
  //     universalIdentifier: '...',
  //     fieldMetadataUniversalIdentifier: '...',
  //     direction: 'DESC',
  //   },
  // ],
});
`;
};
