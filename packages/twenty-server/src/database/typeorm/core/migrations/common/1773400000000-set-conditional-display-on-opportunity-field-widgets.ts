import { type MigrationInterface, type QueryRunner } from 'typeorm';

// Sets conditionalDisplay json-logic rules on pageLayoutWidget rows for:
//   - clientAccountTeam widget: visible only when record.addClientAccountTeam === true
//   - lossReason widget: visible only when record.salesStage is CLOSEDLOST or DIDNOTPROCEED
//   - lossNotes widget: same as lossReason
//
// Widgets are identified via configuration->>'fieldMetadataId' (the field they display).
// fieldMetadata rows are looked up by name within the Opportunity objectMetadata.
export class SetConditionalDisplayOnOpportunityFieldWidgets1773400000000
  implements MigrationInterface
{
  name = 'SetConditionalDisplayOnOpportunityFieldWidgets1773400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const opportunityObjectRows: { id: string }[] = await queryRunner.query(
      `SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'opportunity' LIMIT 1`,
    );

    if (opportunityObjectRows.length === 0) {
      console.warn(
        'SetConditionalDisplayOnOpportunityFieldWidgets: opportunity objectMetadata not found, skipping',
      );
      return;
    }

    const opportunityObjectId = opportunityObjectRows[0].id;

    const fieldRows: { id: string; name: string }[] = await queryRunner.query(
      `SELECT id, name FROM core."fieldMetadata"
       WHERE "objectMetadataId" = $1
         AND name IN ('clientAccountTeam', 'lossReason', 'lossNotes')`,
      [opportunityObjectId],
    );

    const fieldIdByName: Record<string, string> = {};
    for (const row of fieldRows) {
      fieldIdByName[row.name] = row.id;
    }

    // clientAccountTeam widget: show only when addClientAccountTeam is true
    if (fieldIdByName['clientAccountTeam']) {
      await queryRunner.query(
        `UPDATE core."pageLayoutWidget"
         SET "conditionalDisplay" = $1
         WHERE configuration->>'fieldMetadataId' = $2
           AND "deletedAt" IS NULL`,
        [
          JSON.stringify({
            '===': [{ var: 'record.addClientAccountTeam' }, true],
          }),
          fieldIdByName['clientAccountTeam'],
        ],
      );
    } else {
      console.warn(
        'SetConditionalDisplayOnOpportunityFieldWidgets: clientAccountTeam field not found',
      );
    }

    const lossStageRule = JSON.stringify({
      in: [{ var: 'record.salesStage' }, ['CLOSEDLOST', 'DIDNOTPROCEED']],
    });

    // lossReason widget: show only when salesStage is a loss stage
    if (fieldIdByName['lossReason']) {
      await queryRunner.query(
        `UPDATE core."pageLayoutWidget"
         SET "conditionalDisplay" = $1
         WHERE configuration->>'fieldMetadataId' = $2
           AND "deletedAt" IS NULL`,
        [lossStageRule, fieldIdByName['lossReason']],
      );
    } else {
      console.warn(
        'SetConditionalDisplayOnOpportunityFieldWidgets: lossReason field not found',
      );
    }

    // lossNotes widget: same condition as lossReason
    if (fieldIdByName['lossNotes']) {
      await queryRunner.query(
        `UPDATE core."pageLayoutWidget"
         SET "conditionalDisplay" = $1
         WHERE configuration->>'fieldMetadataId' = $2
           AND "deletedAt" IS NULL`,
        [lossStageRule, fieldIdByName['lossNotes']],
      );
    } else {
      console.warn(
        'SetConditionalDisplayOnOpportunityFieldWidgets: lossNotes field not found',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const opportunityObjectRows: { id: string }[] = await queryRunner.query(
      `SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'opportunity' LIMIT 1`,
    );

    if (opportunityObjectRows.length === 0) {
      return;
    }

    const opportunityObjectId = opportunityObjectRows[0].id;

    const fieldRows: { id: string }[] = await queryRunner.query(
      `SELECT id FROM core."fieldMetadata"
       WHERE "objectMetadataId" = $1
         AND name IN ('clientAccountTeam', 'lossReason', 'lossNotes')`,
      [opportunityObjectId],
    );

    for (const row of fieldRows) {
      await queryRunner.query(
        `UPDATE core."pageLayoutWidget"
         SET "conditionalDisplay" = NULL
         WHERE configuration->>'fieldMetadataId' = $1
           AND "deletedAt" IS NULL`,
        [row.id],
      );
    }
  }
}
