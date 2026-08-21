import { TIMELINE_ACTIVITY_ACTIONS } from 'twenty-shared/timeline';
import { isNonEmptyArray } from 'twenty-shared/utils';

const LINKED_NAME_PREFIX = 'linked-';

// Mirrors getTimelineActivityAction: the legacy name encodes the action, and a
// linked row's create and delete are really a link and an unlink. Rows whose
// name carries no known action keep a null action and the read-time fallback.
export const buildTimelineActivityBackfillQuery = ({
  schemaName,
  objectMetadataIdByNameSingular,
  targetColumnByObjectMetadataId,
}: {
  schemaName: string;
  objectMetadataIdByNameSingular: [string, string][];
  targetColumnByObjectMetadataId: [string, string][];
}): { query: string; parameters: unknown[] } => {
  const parameters: unknown[] = [];

  // Placeholders are numbered by binding order rather than by hand, so a value
  // can never drift away from the index the query text refers to.
  const bind = (value: unknown): string => {
    parameters.push(value);

    return `$${parameters.length}`;
  };

  const actionsParameter = bind(TIMELINE_ACTIVITY_ACTIONS);

  const namePrefix = `split_part(source."name", '.', 1)`;
  const nameAction = `split_part(source."name", '.', 2)`;
  const sourceNameSingular = `CASE
        WHEN ${namePrefix} LIKE '${LINKED_NAME_PREFIX}%'
        THEN substring(${namePrefix} FROM ${LINKED_NAME_PREFIX.length + 1})
        ELSE ${namePrefix}
      END`;

  const objectValues = objectMetadataIdByNameSingular
    .map(([nameSingular, objectMetadataId], index) => {
      const nameParameter = bind(nameSingular);
      const idParameter = bind(objectMetadataId);

      // Postgres infers the VALUES column types from the first row only.
      return index === 0
        ? `(${nameParameter}::text, ${idParameter}::uuid)`
        : `(${nameParameter}, ${idParameter})`;
    })
    .join(', ');

  const selfSourceObjectMetadataId = isNonEmptyArray(
    targetColumnByObjectMetadataId,
  )
    ? `CASE
${targetColumnByObjectMetadataId
  .map(
    ([columnName, objectMetadataId]) =>
      `            WHEN source."${columnName}" IS NOT NULL THEN ${bind(objectMetadataId)}::uuid`,
  )
  .join('\n')}
          END`
    : 'NULL::uuid';

  // Two legacy name formats exist: 'linked-note.created' and 'message.linked'.
  const isLinkRow = `(source."name" LIKE '${LINKED_NAME_PREFIX}%' OR ${nameAction} IN ('linked', 'unlinked'))`;

  // A link row's source is the object it links, a self row's source is its own
  // target. Both are stored on the row and survive a rename, so the name parsed
  // from the legacy format is only the last resort.
  const query = `UPDATE "${schemaName}"."timelineActivity" AS target
      SET "action" = derived."action",
          "sourceObjectMetadataId" = COALESCE(
            target."sourceObjectMetadataId",
            derived."storedObjectMetadataId",
            derived."objectMetadataId"
          )
      FROM (
        SELECT
          source."id",
          CASE
            WHEN source."name" LIKE '${LINKED_NAME_PREFIX}%'
              AND ${nameAction} = 'created' THEN 'linked'
            WHEN source."name" LIKE '${LINKED_NAME_PREFIX}%'
              AND ${nameAction} = 'deleted' THEN 'unlinked'
            ELSE ${nameAction}
          END AS "action",
          CASE
            WHEN source."linkedObjectMetadataId" IS NOT NULL
              THEN source."linkedObjectMetadataId"
            WHEN ${isLinkRow} THEN NULL
            ELSE ${selfSourceObjectMetadataId}
          END AS "storedObjectMetadataId",
          object."objectMetadataId"
        FROM "${schemaName}"."timelineActivity" AS source
        LEFT JOIN (VALUES ${objectValues})
          AS object("nameSingular", "objectMetadataId")
          ON object."nameSingular" = ${sourceNameSingular}
        WHERE source."action" IS NULL
          AND source."name" IS NOT NULL
          AND ${nameAction} = ANY(${actionsParameter}::text[])
      ) AS derived
      WHERE target."id" = derived."id"`;

  return { query, parameters };
};
