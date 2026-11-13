import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

// A value a standard field does not declare was added by the workspace, so the workspace application owns it.
const IS_WORKSPACE_ADDED_STANDARD_OPTION = `
  application."universalIdentifier" = $1
  AND workspace."workspaceCustomApplicationId" IS NOT NULL
  AND field."universalIdentifier" IN (
    SELECT "universalIdentifier" FROM jsonb_to_recordset($2::jsonb) AS standard_field("universalIdentifier" uuid)
  )
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_to_recordset($3::jsonb) AS standard_option("fieldUniversalIdentifier" uuid, value text)
    WHERE standard_option."fieldUniversalIdentifier" = field."universalIdentifier"
      AND standard_option.value = candidate.value
  )`;

// Matches isValidUniversalIdentifier on lowercase ids.
const LOWERCASE_UNIVERSAL_IDENTIFIER_PATTERN =
  '^[0-9a-f]{8}-[0-9a-f]{4}-[4-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

// Readers switch from fieldMetadata.options to option rows, so every stored option needs a row first.
@RegisteredInstanceCommand('2.59.0', 1794576631992, { type: 'slow' })
export class BackfillFieldMetadataOptionRowsFromStoredOptionsSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const {
      allFlatEntityMaps: { flatFieldMetadataMaps: standardFlatFieldMetadataMaps },
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId: v4(),
      twentyStandardApplicationId: v4(),
    });

    const standardEnumFlatFieldMetadatas = Object.values(
      standardFlatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isEnumFlatFieldMetadata);

    const standardParameters = [
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      JSON.stringify(
        standardEnumFlatFieldMetadatas.map(({ universalIdentifier }) => ({
          universalIdentifier,
        })),
      ),
      JSON.stringify(
        standardEnumFlatFieldMetadatas.flatMap(
          ({ universalIdentifier, options }) =>
            (options ?? []).map(({ value }) => ({
              fieldUniversalIdentifier: universalIdentifier,
              value,
            })),
        ),
      ),
    ];

    const changedRows: { workspaceId: string }[] = await dataSource.transaction(
      async (entityManager) => {
        // The 2.57 backfill gave workspace additions to standard fields the standard application.
        const reassignedRows: { workspaceId: string }[] =
          await entityManager.query(
            `UPDATE core."fieldMetadataOption" AS candidate
              SET "applicationId" = workspace."workspaceCustomApplicationId", "updatedAt" = now()
              FROM core."fieldMetadata" AS field
                JOIN core.application AS application ON application.id = field."applicationId"
                JOIN core.workspace AS workspace ON workspace.id = field."workspaceId"
              WHERE candidate."fieldMetadataId" = field.id
                AND candidate."applicationId" = field."applicationId"
                AND ${IS_WORKSPACE_ADDED_STANDARD_OPTION}
              RETURNING candidate."workspaceId"`,
            standardParameters,
          );

        const insertedRows: { workspaceId: string }[] =
          await entityManager.query(
            `WITH stored_option AS (
                SELECT DISTINCT ON (field.id, stored.option->>'value')
                  field."workspaceId", field.id AS "fieldMetadataId",
                  stored.option->>'id' AS "optionId", stored.option->>'value' AS value,
                  stored.option->>'label' AS label,
                  CASE WHEN jsonb_typeof(stored.option->'color') = 'string'
                    THEN stored.option->>'color' END AS color,
                  CASE WHEN jsonb_typeof(stored.option->'position') = 'number'
                    THEN (stored.option->>'position')::double precision
                    ELSE stored.index - 1 END AS position,
                  stored.index
                FROM core."fieldMetadata" AS field
                  CROSS JOIN LATERAL jsonb_array_elements(field.options) WITH ORDINALITY AS stored(option, index)
                WHERE field.type IN ('SELECT', 'MULTI_SELECT', 'RATING')
                  AND jsonb_typeof(field.options) = 'array'
                  AND jsonb_typeof(stored.option) = 'object'
                  AND jsonb_typeof(stored.option->'value') = 'string'
                  AND stored.option->>'value' <> ''
                  AND jsonb_typeof(stored.option->'label') = 'string'
                ORDER BY field.id, stored.option->>'value', stored.index
              ),
              candidate AS (
                SELECT stored_option.*,
                  stored_option."optionId" ~ $4
                    AND ROW_NUMBER() OVER (
                      PARTITION BY stored_option."workspaceId", stored_option."optionId"
                      ORDER BY stored_option."fieldMetadataId", stored_option.index
                    ) = 1
                    AND NOT EXISTS (
                      SELECT 1 FROM core."fieldMetadataOption" AS existing
                      WHERE existing."workspaceId" = stored_option."workspaceId"
                        AND existing."universalIdentifier"::text = stored_option."optionId"
                    ) AS "isOptionIdReusable"
                FROM stored_option
                WHERE NOT EXISTS (
                  SELECT 1 FROM core."fieldMetadataOption" AS existing
                  WHERE existing."fieldMetadataId" = stored_option."fieldMetadataId"
                    AND existing.value = stored_option.value
                )
              )
              INSERT INTO core."fieldMetadataOption"
                ("workspaceId", "universalIdentifier", "applicationId", "fieldMetadataId", value, label, color, position)
              SELECT candidate."workspaceId",
                CASE WHEN candidate."isOptionIdReusable" THEN candidate."optionId"::uuid ELSE uuid_generate_v4() END,
                CASE WHEN ${IS_WORKSPACE_ADDED_STANDARD_OPTION}
                  THEN workspace."workspaceCustomApplicationId" ELSE field."applicationId" END,
                candidate."fieldMetadataId", candidate.value, candidate.label, candidate.color, candidate.position
              FROM candidate
                JOIN core."fieldMetadata" AS field ON field.id = candidate."fieldMetadataId"
                JOIN core.application AS application ON application.id = field."applicationId"
                JOIN core.workspace AS workspace ON workspace.id = field."workspaceId"
              ON CONFLICT ("workspaceId", "universalIdentifier") DO NOTHING
              RETURNING "workspaceId"`,
            [...standardParameters, LOWERCASE_UNIVERSAL_IDENTIFIER_PATTERN],
          );

        return [...reassignedRows, ...insertedRows];
      },
    );

    for (const workspaceId of new Set(
      changedRows.map(({ workspaceId }) => workspaceId),
    )) {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatFieldMetadataMaps',
        'flatFieldMetadataMapsOrm',
        'flatFieldMetadataOptionMaps',
      ]);
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  // Inserted rows cannot be told apart from rows created since, and the previous owner is not kept.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
