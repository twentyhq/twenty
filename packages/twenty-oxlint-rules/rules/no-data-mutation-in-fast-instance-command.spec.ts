import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-data-mutation-in-fast-instance-command';

const ruleTester = new RuleTester();

const BASE =
  '/project/packages/twenty-server/src/database/commands/upgrade-version-command';

const FAST_FILE = `${BASE}/2-13/2-13-instance-command-fast-1781277453604-rename-flag.ts`;
const SLOW_FILE = `${BASE}/2-13/2-13-instance-command-slow-1781277480000-backfill-flag.ts`;

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Schema changes are exactly what a fast command is for.
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query('ALTER TABLE "core"."x" ADD COLUMN IF NOT EXISTS "y" boolean NOT NULL DEFAULT true'); } }`,
    },
    // A foreign key clause contains DELETE/UPDATE but is not statement-leading DML.
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query('ALTER TABLE "core"."a" ADD CONSTRAINT "fk" FOREIGN KEY ("bId") REFERENCES "core"."b"("id") ON DELETE CASCADE ON UPDATE NO ACTION'); } }`,
    },
    // A column named "updatedAt" must not trip the UPDATE keyword.
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query('ALTER TABLE "core"."x" ADD COLUMN "updatedAt" timestamptz'); } }`,
    },
    // A read-only CTE has no data mutation.
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query(\`WITH recent AS (SELECT "id" FROM "core"."x") SELECT count(*) FROM recent\`); } }`,
    },
    // A read-only CTE that only mentions a keyword in a string is not flagged.
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query(\`WITH note AS (SELECT 'needs update later' AS msg) SELECT msg FROM note\`); } }`,
    },
    // Rollback DML lives in down() and is allowed (incl. via a CTE).
    {
      filename: FAST_FILE,
      code: `class C { async down(q) { await q.query(\`UPDATE "core"."x" SET "y" = false WHERE "z" = true\`); } }`,
    },
    {
      filename: FAST_FILE,
      code: `class C { async down(q) { await q.query(\`WITH ids AS (SELECT "id" FROM "core"."x") UPDATE "core"."x" SET "y" = true\`); } }`,
    },
    // A slow command is the correct home for a data migration.
    {
      filename: SLOW_FILE,
      code: `class C { async runDataMigration(ds) { await ds.query(\`UPDATE "core"."x" SET "y" = false\`); } }`,
    },
    // Files outside the upgrade-command tree are ignored.
    {
      filename: '/project/packages/twenty-front/src/foo.ts',
      code: `class C { async up(q) { await q.query(\`UPDATE "x" SET "y" = 1\`); } }`,
    },
  ],
  invalid: [
    // The incident pattern: bulk UPDATE in up().
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query(\`UPDATE "core"."fieldMetadata" SET "isUIEditable" = false WHERE "isUIReadOnly" = true\`); } }`,
      errors: [{ messageId: 'dataMutationInFastInstanceCommand' }],
    },
    // INSERT in up().
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query('INSERT INTO "core"."x" ("id") VALUES (1)'); } }`,
      errors: [{ messageId: 'dataMutationInFastInstanceCommand' }],
    },
    // DELETE in up().
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query('DELETE FROM "core"."x" WHERE "t" = 1'); } }`,
      errors: [{ messageId: 'dataMutationInFastInstanceCommand' }],
    },
    // Data mutation moved into a helper called by up() is still forbidden.
    {
      filename: FAST_FILE,
      code: `class C { async backfill(q) { await q.query('DELETE FROM "core"."x" WHERE 1 = 1'); } }`,
      errors: [{ messageId: 'dataMutationInFastInstanceCommand' }],
    },
    // CTE-wrapped data mutation in up().
    {
      filename: FAST_FILE,
      code: `class C { async up(q) { await q.query(\`WITH ids AS (SELECT "id" FROM "core"."x") UPDATE "core"."x" SET "y" = false\`); } }`,
      errors: [{ messageId: 'dataMutationInFastInstanceCommand' }],
    },
  ],
});
