import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

// $1 standard application universal identifier, $2 standard enum fields, $3 their declared option values.
// A value the standard field does not declare was added by the workspace, so the workspace application owns it.
const IS_WORKSPACE_ADDED_STANDARD_OPTION = (optionValue: string) => `
  application."universalIdentifier" = $1
  AND workspace."workspaceCustomApplicationId" IS NOT NULL
  AND field."universalIdentifier" IN (
    SELECT "universalIdentifier" FROM jsonb_to_recordset($2::jsonb) AS standard_field("universalIdentifier" uuid)
  )
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_to_recordset($3::jsonb) AS standard_option("fieldUniversalIdentifier" uuid, value text)
    WHERE standard_option."fieldUniversalIdentifier" = field."universalIdentifier"
      AND standard_option.value = ${optionValue}
  )`;

// Matches isValidUniversalIdentifier on lowercase ids, so a reused option id is a valid row identifier.
const LOWERCASE_UNIVERSAL_IDENTIFIER_PATTERN =
  '^[0-9a-f]{8}-[0-9a-f]{4}-[4-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

// Readers switch from fieldMetadata.options to the option rows, so every stored option needs a row before traffic,
// which a slow command does not guarantee. No DDL shares this transaction, so the writes take row locks only.
@RegisteredInstanceCommand('2.59.0', 1794576631992)
export class BackfillFieldMetadataOptionRowsFromStoredOptionsFastInstanceCommand
  implements FastInstanceCommand
{
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    // The 2.57 backfill gave every row its field's application, including workspace additions to standard fields.
    const reassignedRows: { workspaceId: string }[] = await queryRunner.query(
      // oxlint-disable-next-line twenty/no-data-mutation-in-fast-instance-command
      `UPDATE core."fieldMetadataOption" AS option
        SET "applicationId" = workspace."workspaceCustomApplicationId", "updatedAt" = now()
        FROM core."fieldMetadata" AS field
          JOIN core.application AS application ON application.id = field."applicationId"
          JOIN core.workspace AS workspace ON workspace.id = field."workspaceId"
        WHERE option."fieldMetadataId" = field.id
          AND option."applicationId" = field."applicationId"
          AND ${IS_WORKSPACE_ADDED_STANDARD_OPTION('option.value')}
        RETURNING option."workspaceId"`,
      standardParameters,
    );

    // Existing rows are never touched: matched by value, unique per field; one option id per workspace.
    const insertedRows: { workspaceId: string }[] = await queryRunner.query(
      // oxlint-disable-next-line twenty/no-data-mutation-in-fast-instance-command
      `WITH stored_option AS (
          SELECT DISTINCT ON (field.id, stored.option->>'value')
            field."workspaceId", field.id AS "fieldMetadataId", field."applicationId",
            field."universalIdentifier" AS "fieldUniversalIdentifier",
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
        missing_option AS (
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
        SELECT field."workspaceId",
          CASE WHEN field."isOptionIdReusable" THEN field."optionId"::uuid ELSE uuid_generate_v4() END,
          CASE WHEN ${IS_WORKSPACE_ADDED_STANDARD_OPTION('field.value')}
            THEN workspace."workspaceCustomApplicationId" ELSE field."applicationId" END,
          field."fieldMetadataId", field.value, field.label, field.color, field.position
        FROM (
          SELECT missing_option.*, missing_option."fieldUniversalIdentifier" AS "universalIdentifier"
          FROM missing_option
        ) AS field
          JOIN core.application AS application ON application.id = field."applicationId"
          JOIN core.workspace AS workspace ON workspace.id = field."workspaceId"
        ON CONFLICT ("workspaceId", "universalIdentifier") DO NOTHING
        RETURNING "workspaceId"`,
      [...standardParameters, LOWERCASE_UNIVERSAL_IDENTIFIER_PATTERN],
    );

    for (const workspaceId of new Set(
      [...reassignedRows, ...insertedRows].map(
        ({ workspaceId }) => workspaceId,
      ),
    )) {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatFieldMetadataMaps',
        'flatFieldMetadataMapsOrm',
        'flatFieldMetadataOptionMaps',
      ]);
    }
  }

  // Inserted rows cannot be told apart from rows created since, and the previous owner is not kept.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
