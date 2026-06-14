import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-data-mutation-in-fast-instance-command';

const UPGRADE_COMMAND_MARKER = 'upgrade-version-command/';
const FAST_INSTANCE_COMMAND_SEGMENT = 'instance-command-fast-';
const SKIPPED_FILE_REGEX = /\.(spec|test)\.ts$/;

// Statement-leading data-mutation keywords. Schema changes (ALTER/CREATE/DROP)
// are the whole point of a fast command and stay allowed; "ON DELETE CASCADE"
// or a column named "updatedAt" never match because we only test the start of
// each comment-stripped statement.
const DATA_MUTATION_STATEMENT_REGEX = /^(UPDATE|INSERT|DELETE|MERGE)\b/i;

const isFastInstanceCommandFile = (filename: string): boolean => {
  const markerIndex = filename.indexOf(UPGRADE_COMMAND_MARKER);

  if (markerIndex === -1) {
    return false;
  }

  const basename =
    filename
      .slice(markerIndex + UPGRADE_COMMAND_MARKER.length)
      .split('/')
      .pop() ?? '';

  if (SKIPPED_FILE_REGEX.test(basename)) {
    return false;
  }

  return basename.includes(FAST_INSTANCE_COMMAND_SEGMENT);
};

// Only the up() path runs in the ArgoCD PreSync hook before the new pods roll.
// A data mutation in down() is a legitimate rollback backfill, so it is allowed.
const isInsideUpMethod = (node: any): boolean => {
  let current = node.parent;

  while (current) {
    if (
      current.type === 'MethodDefinition' &&
      current.key?.type === 'Identifier' &&
      current.key.name === 'up'
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
};

const getSqlText = (argument: any): string | null => {
  if (argument.type === 'Literal' && typeof argument.value === 'string') {
    return argument.value;
  }

  if (argument.type === 'TemplateLiteral') {
    return argument.quasis.map((quasi: any) => quasi.value.raw).join(' ');
  }

  return null;
};

const findDataMutationKeyword = (sql: string): string | null => {
  const withoutComments = sql
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  for (const statement of withoutComments.split(';')) {
    const match = statement.trim().match(DATA_MUTATION_STATEMENT_REGEX);

    if (match) {
      return match[1].toUpperCase();
    }
  }

  return null;
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow data mutations (UPDATE/INSERT/DELETE) in the up() of a fast instance command; backfills belong in a slow instance command',
    },
    schema: [],
    messages: {
      dataMutationInFastInstanceCommand:
        "Fast instance command up() must not run data mutations (found '{{ keyword }}'). A bulk write held in the same transaction as ADD/ALTER COLUMN keeps an ACCESS EXCLUSIVE lock and can stall reads on hot tables during the deploy. Move the backfill into a slow instance command's runDataMigration().",
    },
  },
  create: (context) => {
    if (!isFastInstanceCommandFile(context.filename)) {
      return {};
    }

    return {
      CallExpression: (node: any) => {
        const callee = node.callee;

        if (
          callee?.type !== 'MemberExpression' ||
          callee.property?.type !== 'Identifier' ||
          callee.property.name !== 'query'
        ) {
          return;
        }

        if (!isInsideUpMethod(node)) {
          return;
        }

        const sqlArgument = node.arguments?.[0];

        if (!sqlArgument) {
          return;
        }

        const sql = getSqlText(sqlArgument);

        if (sql === null) {
          return;
        }

        const keyword = findDataMutationKeyword(sql);

        if (keyword) {
          context.report({
            node: sqlArgument,
            messageId: 'dataMutationInFastInstanceCommand',
            data: { keyword },
          });
        }
      },
    };
  },
});
