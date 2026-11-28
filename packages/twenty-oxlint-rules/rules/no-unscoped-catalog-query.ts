import { defineRule } from '@oxlint/plugins';

import { NO_UNSCOPED_CATALOG_QUERY_EXEMPTIONS } from './no-unscoped-catalog-query.exemptions';

export const RULE_NAME = 'no-unscoped-catalog-query';

const SERVER_SOURCE_MARKER = 'packages/twenty-server/src/';
const SKIPPED_FILE_REGEX =
  /(\.(spec|integration-spec|test)\.ts$)|\/__tests__\//;

// Catalog relations whose size grows with every workspace schema.
const TENANT_SCALED_CATALOG_REGEX =
  /\binformation_schema\s*\.|\bpg_(class|attribute|index|constraint|attrdef|depend|trigger|indexes|tables|views|matviews|sequences|stats|stat_user_tables|statio_user_tables|stat_all_tables|statio_all_tables)\b/i;

const FROM_REGEX = /\bFROM\b/i;
const TRAILING_CLAUSE_REGEX = /\b(ORDER|GROUP)\s+BY\b[\s\S]*$/i;

// A filter only narrows the scan when a table-level column is compared to a value,
// not to another column (`c.oid = a.attrelid` is a join).
const TABLE_SCOPED_FILTER_REGEX =
  /\b(table_name|relname|tablename|indexname|sequencename|viewname|attrelid|indrelid|indexrelid|conrelid|tgrelid|adrelid|oid)\s*(=\s*ANY\b|=\s*(\$\d+|'|to_regclass\b|\(|ARRAY\b)|IN\s*\()|\bto_regclass\s*\(|::\s*regclass\b/i;

const getSqlText = (node: any): string | null => {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === 'TemplateLiteral') {
    return node.quasis.map((quasi: any) => quasi.value.raw).join('$0');
  }

  return null;
};

const stripCommentsAndStrings = (sql: string): string =>
  sql
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:[^']|'')*'/g, "''");

export const isUnscopedCatalogQuery = (sql: string): boolean => {
  const normalized = stripCommentsAndStrings(sql);

  if (!TENANT_SCALED_CATALOG_REGEX.test(normalized)) {
    return false;
  }

  const fromIndex = normalized.search(FROM_REGEX);

  if (fromIndex === -1) {
    return false;
  }

  const predicates = normalized
    .slice(fromIndex)
    .replace(TRAILING_CLAUSE_REGEX, '');

  return !TABLE_SCOPED_FILTER_REGEX.test(predicates);
};

const isLintedFile = (filename: string): boolean => {
  const markerIndex = filename.indexOf(SERVER_SOURCE_MARKER);

  if (markerIndex === -1 || SKIPPED_FILE_REGEX.test(filename)) {
    return false;
  }

  const serverRelativePath = filename.slice(
    markerIndex + 'packages/twenty-server/'.length,
  );

  return !NO_UNSCOPED_CATALOG_QUERY_EXEMPTIONS.some(
    ({ filePath }) => filePath === serverRelativePath,
  );
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow catalog queries (information_schema, pg_class, pg_attribute...) that are not filtered by table',
    },
    schema: [],
    messages: {
      unscopedCatalogQuery:
        'This catalog query is not filtered by table. pg_class has no index on the schema alone, so it scans the catalog of every workspace (2.78M rows on cloud): one per workspace held the writer at 80% CPU during the 2.65 upgrade. Filter with relname = ANY(...) / to_regclass(...), or use ADD/DROP COLUMN IF [NOT] EXISTS instead of reading. See docs/UPGRADE_COMMANDS.md.',
    },
  },
  create: (context) => {
    if (!isLintedFile(context.filename)) {
      return {};
    }

    const check = (node: any) => {
      const sql = getSqlText(node);

      if (sql !== null && isUnscopedCatalogQuery(sql)) {
        context.report({ node, messageId: 'unscopedCatalogQuery' });
      }
    };

    return {
      Literal: check,
      TemplateLiteral: check,
    };
  },
});
