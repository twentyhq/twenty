import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  AppFactoryGeneratedFile,
  AppFactoryGeneratorResult,
  AppFactoryLogicFunctionSpec,
  AppFactoryObjectFieldSpec,
  AppFactoryObjectSpec,
  NormalizedAppFactorySpec,
} from './app-factory-spec';

const normalizeFileName = (value: string): string =>
  value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const escapeString = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');

const toTsLiteral = (value: unknown): string => {
  if (typeof value === 'string') {
    return `'${escapeString(value)}'`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => toTsLiteral(item)).join(', ')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);

    return `{ ${entries
      .map(([key, nestedValue]) => `${key}: ${toTsLiteral(nestedValue)}`)
      .join(', ')} }`;
  }

  throw new Error(`Unsupported literal type in generator: ${typeof value}`);
};

const renderObjectField = (
  field: AppFactoryObjectFieldSpec,
  index: number,
): string => {
  const lines: string[] = [
    `      universalIdentifier: '${escapeString(field.universalIdentifier)}',`,
    `      type: FieldType.${field.type},`,
    `      name: '${escapeString(field.name)}',`,
    `      label: '${escapeString(field.label)}',`,
    `      icon: '${escapeString(field.icon)}',`,
  ];

  if (field.description) {
    lines.push(`      description: '${escapeString(field.description)}',`);
  }

  if (field.isNullable !== undefined) {
    lines.push(`      isNullable: ${field.isNullable},`);
  }

  if (field.defaultValue !== undefined) {
    lines.push(`      defaultValue: ${toTsLiteral(field.defaultValue)},`);
  }

  if (field.options) {
    lines.push('      options: [');

    for (const [optionIndex, option] of field.options.entries()) {
      const optionPosition = option.position ?? optionIndex;
      const optionLines: string[] = [
        `        { id: '${escapeString(option.id)}', value: '${escapeString(option.value)}', label: '${escapeString(option.label)}', position: ${optionPosition}`,
      ];

      if (option.color) {
        optionLines[0] += `, color: '${escapeString(option.color)}'`;
      }

      optionLines[0] += ' },';
      lines.push(...optionLines);
    }

    lines.push('      ],');
  }

  const prefix = index === 0 ? '    {' : '    {';

  return [prefix, ...lines, '    },'].join('\n');
};

const renderObjectFile = (objectSpec: AppFactoryObjectSpec): string => {
  const labelIdentifierFieldMetadataUniversalIdentifier =
    objectSpec.labelIdentifierFieldMetadataUniversalIdentifier ??
    objectSpec.fields[0]?.universalIdentifier;

  const fields = objectSpec.fields
    .map((field, index) => renderObjectField(field, index))
    .join('\n');

  const descriptionLine = objectSpec.description
    ? `  description: '${escapeString(objectSpec.description)}',\n`
    : '';

  return `import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  universalIdentifier: '${escapeString(objectSpec.universalIdentifier)}',
  nameSingular: '${escapeString(objectSpec.nameSingular)}',
  namePlural: '${escapeString(objectSpec.namePlural)}',
  labelSingular: '${escapeString(objectSpec.labelSingular)}',
  labelPlural: '${escapeString(objectSpec.labelPlural)}',
${descriptionLine}  icon: '${escapeString(objectSpec.icon)}',
  labelIdentifierFieldMetadataUniversalIdentifier: '${escapeString(labelIdentifierFieldMetadataUniversalIdentifier ?? '')}',
  fields: [
${fields}
  ],
});
`;
};

const renderHandlerFunction = (logicFunctionSpec: AppFactoryLogicFunctionSpec): string => {
  if (logicFunctionSpec.handlerBody) {
    return `const handler = async () => {
${logicFunctionSpec.handlerBody
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
};`;
  }

  return `const handler = async () => {
  return { ok: true };
};`;
};

const renderLogicFunctionFile = (
  logicFunctionSpec: AppFactoryLogicFunctionSpec,
): string => {
  const routeTriggerLines = logicFunctionSpec.routeTrigger
    ? `,
  httpRouteTriggerSettings: {
    path: '${escapeString(logicFunctionSpec.routeTrigger.path)}',
    httpMethod: '${logicFunctionSpec.routeTrigger.httpMethod}',
    isAuthRequired: ${logicFunctionSpec.routeTrigger.isAuthRequired ?? true},
    forwardedRequestHeaders: ${toTsLiteral(
      logicFunctionSpec.routeTrigger.forwardedRequestHeaders ?? [],
    )},
  }`
    : '';

  return `import { defineLogicFunction } from 'twenty-sdk/define';

${renderHandlerFunction(logicFunctionSpec)}

export default defineLogicFunction({
  universalIdentifier: '${escapeString(logicFunctionSpec.universalIdentifier)}',
  name: '${escapeString(logicFunctionSpec.name)}',
  description: '${escapeString(logicFunctionSpec.description)}',
  timeoutSeconds: ${logicFunctionSpec.timeoutSeconds ?? 10},
  handler${routeTriggerLines},
});
`;
};

export const generateAppFactoryFiles = (
  appDirectory: string,
  spec: NormalizedAppFactorySpec,
  options?: {
    writeToDisk?: boolean;
  },
): AppFactoryGeneratorResult => {
  const writeToDisk = options?.writeToDisk ?? true;
  const objectsDirectory = join(appDirectory, 'src', 'objects');
  const logicFunctionsDirectory = join(appDirectory, 'src', 'logic-functions');

  if (writeToDisk) {
    mkdirSync(objectsDirectory, { recursive: true });
    mkdirSync(logicFunctionsDirectory, { recursive: true });
  }

  const files: AppFactoryGeneratedFile[] = [];

  for (const objectSpec of spec.generation.objects) {
    const fileNameBase = normalizeFileName(
      objectSpec.fileName ?? objectSpec.nameSingular,
    );
    const path = join(objectsDirectory, `${fileNameBase}.object.ts`);
    const content = renderObjectFile(objectSpec);
    if (writeToDisk) {
      writeFileSync(path, content, 'utf8');
    }
    files.push({ path, content });
  }

  for (const logicFunctionSpec of spec.generation.logicFunctions) {
    const fileNameBase = normalizeFileName(
      logicFunctionSpec.fileName ?? logicFunctionSpec.name,
    );
    const path = join(logicFunctionsDirectory, `${fileNameBase}.ts`);
    const content = renderLogicFunctionFile(logicFunctionSpec);
    if (writeToDisk) {
      writeFileSync(path, content, 'utf8');
    }
    files.push({ path, content });
  }

  return { files };
};
