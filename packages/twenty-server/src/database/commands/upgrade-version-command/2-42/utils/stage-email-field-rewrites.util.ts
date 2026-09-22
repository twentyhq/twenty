import { isNonEmptyString } from '@sniptt/guards';
import { type QueryRunner } from 'typeorm';

import { FIRST_EMAIL_RECORD_ID } from 'src/database/commands/upgrade-version-command/2-42/constants/first-email-record-id.constant';
import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';
import { normalizeEmailsSubfieldValue } from 'src/engine/core-modules/record-transformer/utils/normalize-emails-subfield-value.util';

const BACKFILL_BATCH_SIZE = 5000;

type EmailRow = {
  id: string;
  primaryEmail: string | null;
  additionalEmails: unknown;
};

type EmailRewrite = EmailRow & {
  primaryChanged: boolean;
  additionalChanged: boolean;
};

export const stageEmailFieldRewrites = async ({
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
    const rows = await runner.manager.query<EmailRow[]>(
      `
SELECT "id",
       ${primaryColumn} AS "primaryEmail",
       ${additionalColumn} AS "additionalEmails"
FROM ${tableReference}
WHERE "id" > $1
  AND (${primaryColumn} IS NOT NULL OR ${additionalColumn} IS NOT NULL)
ORDER BY "id"
LIMIT $2
`,
      [afterId, BACKFILL_BATCH_SIZE],
    );

    if (rows.length === 0) {
      break;
    }

    afterId = rows[rows.length - 1].id;

    const rewrites = rows.flatMap((row): EmailRewrite[] => {
      const primaryEmail = isNonEmptyString(row.primaryEmail)
        ? normalizeEmailAddress(row.primaryEmail)
        : row.primaryEmail;
      const additionalEmails = normalizeEmailsSubfieldValue({
        subFieldName: 'additionalEmails',
        value: row.additionalEmails,
      });
      const primaryChanged = primaryEmail !== row.primaryEmail;
      const additionalChanged =
        JSON.stringify(additionalEmails) !== JSON.stringify(row.additionalEmails);

      return primaryChanged || additionalChanged
        ? [
            {
              id: row.id,
              primaryEmail,
              additionalEmails,
              primaryChanged,
              additionalChanged,
            },
          ]
        : [];
    });

    if (rewrites.length > 0) {
      await runner.query(
        `
INSERT INTO ${candidateTable}
  ("id", "primaryEmail", "additionalEmails", "primaryChanged", "additionalChanged")
SELECT "id", "primaryEmail", "additionalEmails", "primaryChanged", "additionalChanged"
FROM jsonb_to_recordset($1::jsonb) AS changes(
  "id" uuid,
  "primaryEmail" text,
  "additionalEmails" jsonb,
  "primaryChanged" boolean,
  "additionalChanged" boolean
)
`,
        [JSON.stringify(rewrites)],
      );
    }

    if (rows.length < BACKFILL_BATCH_SIZE) {
      break;
    }
  }
};
