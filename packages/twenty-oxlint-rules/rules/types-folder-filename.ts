import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'types-folder-filename';

const PASCAL_CASE_REGEX = /^[A-Z][A-Za-z0-9]*\.tsx?$/;
const KEBAB_CASE_TYPE_SUFFIX_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*\.type\.ts$/;

const SKIPPED_FILE_REGEX = /\.(spec|test|stories|snap)\.tsx?$/;

const DEFAULT_ALLOWED_SUFFIXES = [
  'd',
  'enum',
  'interface',
  'schema',
  'constant',
  'const',
  'types',
  'input',
  'guard',
  'validator',
  'composite-type',
];

type Convention = 'PascalCase' | 'kebab-case-type-suffix';

type RuleOptions = {
  convention?: Convention;
  allowedSuffixes?: string[];
};

const CONVENTIONS = {
  PascalCase: {
    regex: PASCAL_CASE_REGEX,
    messageId: 'invalidPascalCaseFilename',
  },
  'kebab-case-type-suffix': {
    regex: KEBAB_CASE_TYPE_SUFFIX_REGEX,
    messageId: 'invalidKebabCaseTypeFilename',
  },
} as const;

const buildAllowedSuffixRegex = (suffixes: string[]) =>
  new RegExp(`\\.(?:${suffixes.join('|')})\\.tsx?$`);

const isInsideTypesFolder = (filename: string): boolean => {
  const segments = filename.split('/');

  return segments.length >= 2 && segments[segments.length - 2] === 'types';
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce a single filename convention for files directly inside a types/ folder',
    },
    schema: [
      {
        type: 'object',
        properties: {
          convention: {
            type: 'string',
            enum: ['PascalCase', 'kebab-case-type-suffix'],
          },
          allowedSuffixes: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    ],
    messages: {
      invalidPascalCaseFilename:
        "Type file '{{ name }}' must be named {PascalCase}.ts after the type it exports (e.g. 'OrderBy.ts'), without a '.type' suffix.",
      invalidKebabCaseTypeFilename:
        "Type file '{{ name }}' must be named {kebab-case}.type.ts (e.g. 'workflow-action-input.type.ts').",
    },
  },
  create: (context) => {
    const [options] = context.options as [RuleOptions | undefined];
    const convention = options?.convention ?? 'PascalCase';
    const allowedSuffixRegex = buildAllowedSuffixRegex(
      options?.allowedSuffixes ?? DEFAULT_ALLOWED_SUFFIXES,
    );

    return {
      Program: (node: any) => {
        const filename = context.filename;

        if (!isInsideTypesFolder(filename)) {
          return;
        }

        const basename = filename.split('/').pop() ?? '';

        if (basename === 'index.ts' || SKIPPED_FILE_REGEX.test(basename)) {
          return;
        }

        if (allowedSuffixRegex.test(basename)) {
          return;
        }

        const { regex, messageId } = CONVENTIONS[convention];

        if (!regex.test(basename)) {
          context.report({
            node,
            messageId,
            data: { name: basename },
          });
        }
      },
    };
  },
});
