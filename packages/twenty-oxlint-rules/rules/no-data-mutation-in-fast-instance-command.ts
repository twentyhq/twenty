import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-data-mutation-in-fast-instance-command';

const UPGRADE_COMMAND_MARKER = 'upgrade-version-command/';
const FAST_INSTANCE_COMMAND_SEGMENT = 'instance-command-fast-';
const SKIPPED_FILE_REGEX = /\.(spec|test)\.ts$/;

const DATA_MUTATION_STATEMENT_REGEX = /^(UPDATE|INSERT|DELETE|MERGE)\b/i;
const CTE_DATA_MUTATION_REGEX =
  /^WITH\b[\s\S]*[()]\s*(UPDATE|INSERT|DELETE|MERGE)\b/i;

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

const isInsideDownMethod = (node: any): boolean => {
  let current = node.parent;

  while (current) {
    if (
      (current.type === 'MethodDefinition' ||
        current.type === 'PropertyDefinition') &&
      current.key?.type === 'Identifier' &&
      current.key.name === 'down'
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
  const normalized = sql
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:[^']|'')*'/g, "''")
    .replace(/"(?:[^"]|"")*"/g, '""');

  for (const statement of normalized.split(';')) {
    const trimmed = statement.trim();
    const match =
      trimmed.match(DATA_MUTATION_STATEMENT_REGEX) ??
      trimmed.match(CTE_DATA_MUTATION_REGEX);

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
        'Disallow data mutations (UPDATE/INSERT/DELETE) in a fast instance command outside down(); backfills belong in a slow instance command',
    },
    schema: [],
    messages: {
      dataMutationInFastInstanceCommand:
        "Fast instance commands must not run data mutations outside down() (found '{{ keyword }}'). A bulk write held in the same transaction as ADD/ALTER COLUMN keeps an ACCESS EXCLUSIVE lock and can stall reads during the deploy. Put backfills in a slow instance command's runDataMigration(); rollback writes belong in down().",
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

        if (isInsideDownMethod(node)) {
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
