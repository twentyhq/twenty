import { type QueryRunner } from 'typeorm';

import { applyEmailFieldRewrites } from 'src/database/commands/upgrade-version-command/2-42/utils/apply-email-field-rewrites.util';
import { stageEmailFieldRewrites } from 'src/database/commands/upgrade-version-command/2-42/utils/stage-email-field-rewrites.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const CANDIDATE_TABLE = 'emailNormalizationCandidates';

export const normalizeEmailField = async ({
  runner,
  tableReference,
  primaryColumn,
  additionalColumn,
  isUnique,
  dryRun,
}: {
  runner: QueryRunner;
  tableReference: string;
  primaryColumn: string;
  additionalColumn: string;
  isUnique: boolean;
  dryRun: boolean;
}): Promise<{
  rewriteCount: number;
  updateCount: number;
  collisionCount: number;
  collisions: { id: string; primaryEmail: string }[];
}> => {
  const candidateTable = escapeIdentifier(CANDIDATE_TABLE);

  await runner.query(`
CREATE TEMP TABLE ${candidateTable} (
  "id" uuid PRIMARY KEY,
  "primaryEmail" text,
  "additionalEmails" jsonb,
  "primaryChanged" boolean NOT NULL,
  "additionalChanged" boolean NOT NULL,
  "collision" boolean NOT NULL DEFAULT false
)
`);

  try {
    await stageEmailFieldRewrites({
      runner,
      tableReference,
      primaryColumn,
      additionalColumn,
      candidateTable,
    });

    if (isUnique) {
      await runner.query(`
UPDATE ${candidateTable} candidate
SET "collision" = true
WHERE candidate."id" IN (
  SELECT candidate."id"
  FROM ${candidateTable} candidate
  JOIN (
    SELECT "primaryEmail"
    FROM ${candidateTable}
    WHERE "primaryChanged"
    GROUP BY "primaryEmail"
    HAVING count(*) > 1
  ) duplicates ON duplicates."primaryEmail" = candidate."primaryEmail"
  WHERE candidate."primaryChanged"
  UNION
  SELECT candidate."id"
  FROM ${candidateTable} candidate
  JOIN ${tableReference} existing
    ON existing.${primaryColumn} = candidate."primaryEmail"
   AND existing."id" <> candidate."id"
  WHERE candidate."primaryChanged"
)
`);
    }

    const [counts] = await runner.manager.query<
      {
        rewriteCount: string;
        updateCount: string;
        collisionCount: string;
      }[]
    >(`
SELECT count(*) AS "rewriteCount",
       count(*) FILTER (WHERE NOT "collision" OR "additionalChanged") AS "updateCount",
       count(*) FILTER (WHERE "collision") AS "collisionCount"
FROM ${candidateTable}
`);
    const rewriteCount = Number(counts?.rewriteCount ?? 0);
    const updateCount = Number(counts?.updateCount ?? 0);
    const collisionCount = Number(counts?.collisionCount ?? 0);

    if (rewriteCount > 0 && !dryRun) {
      await applyEmailFieldRewrites({
        runner,
        tableReference,
        primaryColumn,
        additionalColumn,
        candidateTable,
      });
    }

    const collisions =
      collisionCount > 0
        ? await runner.manager.query<{ id: string; primaryEmail: string }[]>(`
SELECT "id", "primaryEmail"
FROM ${candidateTable}
WHERE "collision"
ORDER BY "id"
LIMIT 20
`)
        : [];

    return { rewriteCount, updateCount, collisionCount, collisions };
  } finally {
    await runner.query(`DROP TABLE IF EXISTS ${candidateTable}`);
  }
};
