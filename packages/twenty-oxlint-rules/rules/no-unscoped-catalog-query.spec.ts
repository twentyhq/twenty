import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-unscoped-catalog-query';

const ruleTester = new RuleTester();

const COMMAND_FILE =
  '/project/packages/twenty-server/src/database/commands/upgrade-version-command/2-66/2-66-workspace-command-1795800000000-add-column.command.ts';
const RUNTIME_FILE =
  '/project/packages/twenty-server/src/engine/metadata-modules/some/some.service.ts';
const SPEC_FILE =
  '/project/packages/twenty-server/src/engine/metadata-modules/some/__tests__/some.service.spec.ts';
const EXEMPTED_FILE =
  '/project/packages/twenty-server/src/database/commands/upgrade-version-command/2-65/2-65-workspace-command-1795707939505-provision-rich-text-files-columns.command.ts';
const FRONT_FILE = '/project/packages/twenty-front/src/modules/some/some.ts';

const SCHEMA_ONLY_COLUMNS_QUERY = `class C { run(q, s) { return q.query(\`SELECT table_name AS "tableName", column_name AS "columnName" FROM information_schema.columns WHERE table_schema = $1\`, [s]); } }`;

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      filename: COMMAND_FILE,
      code: `class C { run(q, s, t) { return q.query(\`SELECT c.relname, a.attname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace JOIN pg_attribute a ON a.attrelid = c.oid WHERE n.nspname = $1 AND c.relname = ANY($2)\`, [s, t]); } }`,
    },
    {
      filename: COMMAND_FILE,
      code: `class C { run(q, t) { return q.query('SELECT 1 FROM pg_attribute WHERE attrelid = to_regclass($1) AND attname = $2 AND NOT attisdropped', [t, 'x']); } }`,
    },
    {
      filename: COMMAND_FILE,
      code: `class C { run(q, s) { return q.query('SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2', [s, 'person']); } }`,
    },
    {
      filename: COMMAND_FILE,
      code: `class C { run(q, s, t) { return q.query(\`SELECT 1 FROM information_schema.columns WHERE table_schema = '\${s}' AND table_name = \${t}\`); } }`,
    },
    {
      filename: COMMAND_FILE,
      code: `class C { run(q) { return q.query(\`SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'\`); } }`,
    },
    {
      filename: COMMAND_FILE,
      code: `class C { run(q) { return q.query(\`SELECT indexdef FROM pg_index WHERE indexrelid = '"core"."IDX_x"'::regclass\`); } }`,
    },
    // Ordering by relname does not scope the scan, but the relname filter does.
    {
      filename: RUNTIME_FILE,
      code: `const QUERY = \`SELECT relname FROM pg_stat_user_tables WHERE schemaname = $1 AND relname = ANY($2) ORDER BY relname\`;`,
    },
    {
      filename: RUNTIME_FILE,
      code: `class C { run(q) { return q.query('SELECT pid FROM pg_stat_activity WHERE state = $1', ['active']); } }`,
    },
    { filename: SPEC_FILE, code: SCHEMA_ONLY_COLUMNS_QUERY },
    { filename: EXEMPTED_FILE, code: SCHEMA_ONLY_COLUMNS_QUERY },
    { filename: FRONT_FILE, code: SCHEMA_ONLY_COLUMNS_QUERY },
    {
      filename: RUNTIME_FILE,
      code: `const message = 'information_schema is slow on many-tenant instances';`,
    },
  ],
  invalid: [
    // The 2.65 incident query: table_name in the select list does not scope the scan.
    {
      filename: COMMAND_FILE,
      code: SCHEMA_ONLY_COLUMNS_QUERY,
      errors: [{ messageId: 'unscopedCatalogQuery' }],
    },
    {
      filename: COMMAND_FILE,
      code: `class C { run(q, s) { return q.query('SELECT table_name FROM information_schema.columns WHERE table_schema = $1 AND column_name = $2', [s, 'x']); } }`,
      errors: [{ messageId: 'unscopedCatalogQuery' }],
    },
    // A join on attrelid is not a filter.
    {
      filename: RUNTIME_FILE,
      code: `class C { run(q, s) { return q.query(\`SELECT c.relname FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_attribute a ON c.oid = a.attrelid WHERE n.nspname = $1 AND c.relkind = 'r'\`, [s]); } }`,
      errors: [{ messageId: 'unscopedCatalogQuery' }],
    },
    {
      filename: RUNTIME_FILE,
      code: `const QUERY = 'SELECT relname FROM pg_catalog.pg_class WHERE relnamespace = $1 ORDER BY relname = ANY($2)';`,
      errors: [{ messageId: 'unscopedCatalogQuery' }],
    },
    {
      filename: RUNTIME_FILE,
      code: `class C { run(q) { return q.query('SELECT relname FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 10'); } }`,
      errors: [{ messageId: 'unscopedCatalogQuery' }],
    },
  ],
});
