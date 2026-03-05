import kebabCase from 'lodash.kebabcase';
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

  const fieldsBlock =
    fields.length > 0
      ? `  fields: [
${fields
  .map((field) => {
    const uid = field.universalIdentifier ?? v4();
    const parts = [
      `      universalIdentifier: '${uid}'`,
      `      fieldMetadataUniversalIdentifier: '${field.fieldMetadataUniversalIdentifier}'`,
      `      position: ${field.position}`,
    ];
    if (field.isVisible !== undefined) {
      parts.push(`      isVisible: ${field.isVisible}`);
    }
    if (field.size !== undefined) {
      parts.push(`      size: ${field.size}`);
    }
    return `    {\n${parts.join(',\n')},\n    }`;
  })
  .join(',\n')}
  ],`
      : `  // fields: [
  //   {
  //     universalIdentifier: '...',
  //     fieldMetadataUniversalIdentifier: '...',
  //     position: 0,
  //     isVisible: true,
  //   },
  // ],`;

  return `import { defineView } from 'twenty-sdk';

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
});
`;
};
