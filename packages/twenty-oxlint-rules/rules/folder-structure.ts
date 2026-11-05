import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'folder-structure';

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const USE_PASCAL_CASE_FILE_REGEX = /^use[A-Z][a-zA-Z0-9]*\.(ts|tsx)$/;
const CAMEL_CASE_UTIL_FILE_REGEX = /^[a-z][a-zA-Z0-9]*\.(ts|tsx)$/;

const LEAF_SUBDIRS_WITHOUT_FILE_NAMING_CONSTRAINT = new Set([
  'states',
  'types',
  'graphql',
  'components',
  'effect-components',
  'constants',
  'validation-schemas',
  'contexts',
  'scopes',
  'services',
  'errors',
]);

const TESTING_DIRS = new Set(['__tests__', '__mocks__', '__snapshots__']);

const MAX_MODULE_DEPTH = 5;
const MAX_HOOKS_INTERNAL_DEPTH = 2;

type PathContext =
  | { type: 'modules_root' }
  | { type: 'module'; depth: number }
  | { type: 'hooks'; internalDepth: number }
  | { type: 'utils' }
  | { type: 'leaf' };

type ValidationError = {
  messageId: string;
  data: Record<string, string | number>;
};

const isFile = (segment: string, isLastSegment: boolean): boolean =>
  isLastSegment;

const validateSegment = (
  segment: string,
  context: PathContext,
  isLastSegment: boolean,
):
  | { nextContext: PathContext; error?: undefined }
  | { error: ValidationError } => {
  switch (context.type) {
    case 'modules_root': {
      if (isFile(segment, isLastSegment)) {
        return {
          error: {
            messageId: 'noFilesInModulesRoot',
            data: { name: segment },
          },
        };
      }
      if (segment === 'types') {
        return { nextContext: { type: 'leaf' } };
      }
      if (!KEBAB_CASE_REGEX.test(segment)) {
        return {
          error: {
            messageId: 'moduleNameNotKebabCase',
            data: { name: segment },
          },
        };
      }
      return { nextContext: { type: 'module', depth: 1 } };
    }

    case 'module': {
      if (isFile(segment, isLastSegment)) {
        return { nextContext: context };
      }
      if (TESTING_DIRS.has(segment)) {
        return { nextContext: { type: 'leaf' } };
      }
      if (segment === 'hooks') {
        return {
          nextContext: { type: 'hooks', internalDepth: 0 },
        };
      }
      if (segment === 'utils') {
        return { nextContext: { type: 'utils' } };
      }
      if (LEAF_SUBDIRS_WITHOUT_FILE_NAMING_CONSTRAINT.has(segment)) {
        return { nextContext: { type: 'leaf' } };
      }
      if (context.depth >= MAX_MODULE_DEPTH) {
        return {
          error: {
            messageId: 'moduleTooDeep',
            data: { max: MAX_MODULE_DEPTH, name: segment },
          },
        };
      }
      if (!KEBAB_CASE_REGEX.test(segment)) {
        return {
          error: {
            messageId: 'moduleNameNotKebabCase',
            data: { name: segment },
          },
        };
      }
      return {
        nextContext: { type: 'module', depth: context.depth + 1 },
      };
    }

    case 'hooks': {
      if (isFile(segment, isLastSegment)) {
        if (!USE_PASCAL_CASE_FILE_REGEX.test(segment)) {
          return {
            error: {
              messageId: 'hookFileNaming',
              data: { name: segment },
            },
          };
        }
        return { nextContext: context };
      }
      if (TESTING_DIRS.has(segment)) {
        return { nextContext: { type: 'leaf' } };
      }
      if (segment === 'internal') {
        if (context.internalDepth >= MAX_HOOKS_INTERNAL_DEPTH) {
          return {
            error: {
              messageId: 'hooksInternalTooDeep',
              data: { max: MAX_HOOKS_INTERNAL_DEPTH },
            },
          };
        }
        return {
          nextContext: {
            type: 'hooks',
            internalDepth: context.internalDepth + 1,
          },
        };
      }
      return {
        error: {
          messageId: 'invalidHooksEntry',
          data: { name: segment },
        },
      };
    }

    case 'utils': {
      if (isFile(segment, isLastSegment)) {
        if (!CAMEL_CASE_UTIL_FILE_REGEX.test(segment)) {
          return {
            error: {
              messageId: 'utilFileNaming',
              data: { name: segment },
            },
          };
        }
        return { nextContext: context };
      }
      if (TESTING_DIRS.has(segment)) {
        return { nextContext: { type: 'leaf' } };
      }
      // Intentionally treated as leaf — files inside these subfolders
      // skip camelCase enforcement to allow flexible organization
      // (e.g. utils/cron-to-human/types/CronParts.ts is valid).
      if (KEBAB_CASE_REGEX.test(segment)) {
        return { nextContext: { type: 'leaf' } };
      }
      return {
        error: {
          messageId: 'invalidUtilsEntry',
          data: { name: segment },
        },
      };
    }

    case 'leaf': {
      return { nextContext: { type: 'leaf' } };
    }
  }
};

const extractModulesRelativePath = (
  filename: string,
): string | null => {
  const marker = '/src/modules/';
  const index = filename.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return filename.slice(index + marker.length);
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce folder structure conventions inside src/modules/ (kebab-case module dirs, allowed subdirs, hook/util file naming)',
    },
    schema: [],
    messages: {
      noFilesInModulesRoot:
        "Files are not allowed directly in src/modules/. Found '{{ name }}'.",
      moduleNameNotKebabCase:
        "Module folder '{{ name }}' must be kebab-case (e.g. 'my-module').",
      moduleTooDeep:
        "Module folder '{{ name }}' exceeds maximum nesting depth of {{ max }}.",
      hookFileNaming:
        "Hook file '{{ name }}' must match use{PascalCase}.(ts|tsx) (e.g. 'useMyHook.ts').",
      hooksInternalTooDeep:
        'hooks/internal/ nesting exceeds maximum depth of {{ max }}.',
      invalidHooksEntry:
        "Unexpected entry '{{ name }}' in hooks/. Only hook files, __tests__/, __mocks__/, and internal/ are allowed.",
      utilFileNaming:
        "Util file '{{ name }}' must match {camelCase}.(ts|tsx) (e.g. 'myUtil.ts').",
      invalidUtilsEntry:
        "Unexpected entry '{{ name }}' in utils/. Only util files, __tests__/, and kebab-case subfolders are allowed.",
    },
  },
  create: (context) => {
    return {
      Program: (node: any) => {
        const relativePath = extractModulesRelativePath(
          context.filename,
        );

        if (!relativePath) {
          return;
        }

        const segments = relativePath.split('/').filter(Boolean);

        if (segments.length === 0) {
          return;
        }

        let currentContext: PathContext = { type: 'modules_root' };

        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          const isLastSegment = i === segments.length - 1;
          const result = validateSegment(
            segment,
            currentContext,
            isLastSegment,
          );

          if ('error' in result) {
            context.report({
              node,
              messageId: result.error.messageId,
              data: result.error.data,
            });
            return;
          }

          currentContext = result.nextContext;
        }
      },
    };
  },
});
