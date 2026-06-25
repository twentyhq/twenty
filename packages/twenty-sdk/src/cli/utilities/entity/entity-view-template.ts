import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { type ViewType } from 'twenty-shared/types';
import { v4 } from 'uuid';

type ViewFieldTemplateBase = {
  universalIdentifier?: string;
  position: number;
  isVisible?: boolean;
  size?: number;
};

type ViewFieldTemplate =
  | (ViewFieldTemplateBase & { fieldMetadataUniversalIdentifier: string })
  | (ViewFieldTemplateBase & { defaultFieldName: string });

const renderFieldEntry = ({
  field,
  index,
  objectUniversalIdentifier,
}: {
  field: ViewFieldTemplate;
  index: number;
  objectUniversalIdentifier: string;
}) => {
  const universalIdentifier = field.universalIdentifier ?? v4();
  const position = field.position ?? index;
  const isVisible = field.isVisible ?? true;
  const size = field.size ?? 200;

  const fieldMetadataUniversalIdentifierLine =
    'defaultFieldName' in field
      ? `    fieldMetadataUniversalIdentifier: generateDefaultFieldUniversalIdentifier({
      objectUniversalIdentifier: '${objectUniversalIdentifier}',
      fieldName: '${field.defaultFieldName}',
    })`
      : `    fieldMetadataUniversalIdentifier: '${field.fieldMetadataUniversalIdentifier}'`;

  return `  {
    universalIdentifier: '${universalIdentifier}',
${fieldMetadataUniversalIdentifierLine},
    position: ${position},
    isVisible: ${isVisible},
    size: ${size},
  }`;
};

export const getViewBaseFile = ({
  name,
  universalIdentifier = v4(),
  objectUniversalIdentifier = 'fill-later',
  fields = [],
  type,
}: {
  name: string;
  universalIdentifier?: string;
  objectUniversalIdentifier?: string;
  fields?: ViewFieldTemplate[];
  type?: ViewType;
}) => {
  const kebabCaseName = kebabCase(name);

  const hasDefaultFieldEntry = fields.some(
    (field) => 'defaultFieldName' in field,
  );

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
${fields
  .map((field, index) =>
    renderFieldEntry({ field, index, objectUniversalIdentifier }),
  )
  .join(',\n')},
  ],`
      : defaultFields;

  const typeBlock = type !== undefined ? `  type: '${type}',\n` : '';

  const imports = hasDefaultFieldEntry
    ? `import {
  defineView,
  generateDefaultFieldUniversalIdentifier,
} from 'twenty-sdk/define';`
    : `import { defineView } from 'twenty-sdk/define';`;

  return `${imports}

export default defineView({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  objectUniversalIdentifier: '${objectUniversalIdentifier}',
${typeBlock}  icon: 'IconList',
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
