import { type QueryRunner } from 'typeorm';

import { FIRST_EMAIL_RECORD_ID } from 'src/database/commands/upgrade-version-command/2-42/constants/first-email-record-id.constant';

const UPDATE_BATCH_SIZE = 1000;

export const applyEmailFieldRewrites = async ({
  runner,
  tableReference,
  primaryColumn,
  additionalColumn,
  candidateTable,
}: {
  runner: QueryRunner;
  tableReference: string;
  primaryColumn: string;
  additionalColumn: string;
  candidateTable: string;
}): Promise<void> => {
  let afterId = FIRST_EMAIL_RECORD_ID;

  for (;;) {
    const batch = await runner.manager.query<{ id: string }[]>(
      `SELECT "id" FROM ${candidateTable} WHERE "id" > $1 ORDER BY "id" LIMIT $2`,
      [afterId, UPDATE_BATCH_SIZE],
    );

    if (batch.length === 0) {
      break;
    }

    afterId = batch[batch.length - 1].id;

    await runner.query(
      `
UPDATE ${tableReference} target
SET ${primaryColumn} = CASE
      WHEN candidate."primaryChanged" AND NOT candidate."collision"
      THEN candidate."primaryEmail" ELSE target.${primaryColumn} END,
    ${additionalColumn} = CASE
      WHEN candidate."additionalChanged"
      THEN candidate."additionalEmails" ELSE target.${additionalColumn} END
FROM ${candidateTable} candidate
WHERE target."id" = candidate."id"
  AND candidate."id" = ANY($1::uuid[])
  AND (candidate."additionalChanged" OR
       (candidate."primaryChanged" AND NOT candidate."collision"))
`,
      [batch.map(({ id }) => id)],
    );

    if (batch.length < UPDATE_BATCH_SIZE) {
      break;
    }
  }
};
