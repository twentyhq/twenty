import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-runtime-import-from-upgrade-command';

const UPGRADE_COMMAND_IMPORT_PREFIX =
  'src/database/commands/upgrade-version-command/';

const ALLOWED_IMPORT_REGEX = /-upgrade-command-name\.constants?$/;

const EXEMPT_FILE_REGEXES = [
  /\/src\/database\/commands\//,
  /\/src\/engine\/core-modules\/upgrade\//,
  /\/test\//,
  /\/__tests__\//,
  /\.spec\.ts$/,
  /\.integration-spec\.ts$/,
];

const isExemptFile = (filename: string): boolean =>
  EXEMPT_FILE_REGEXES.some((regex) => regex.test(filename));

const isForbiddenImportSource = (source: string): boolean =>
  source.startsWith(UPGRADE_COMMAND_IMPORT_PREFIX) &&
  !ALLOWED_IMPORT_REGEX.test(source);

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid runtime code from importing upgrade command code, which is frozen once released',
    },
    schema: [],
    messages: {
      noRuntimeImportFromUpgradeCommand:
        "Runtime code must not import '{{ source }}'. Keep migration-only logic, constants and legacy formats in the version folder, and move shared primitives out of it instead.",
    },
  },
  create: (context) => {
    if (isExemptFile(context.filename)) {
      return {};
    }

    const checkSource = (sourceNode: any) => {
      const source = sourceNode?.value;

      if (typeof source !== 'string' || !isForbiddenImportSource(source)) {
        return;
      }

      context.report({
        node: sourceNode,
        messageId: 'noRuntimeImportFromUpgradeCommand',
        data: { source },
      });
    };

    return {
      ImportDeclaration: (node: any) => checkSource(node.source),
      ExportNamedDeclaration: (node: any) => checkSource(node.source),
      ExportAllDeclaration: (node: any) => checkSource(node.source),
      ImportExpression: (node: any) => checkSource(node.source),
    };
  },
});
