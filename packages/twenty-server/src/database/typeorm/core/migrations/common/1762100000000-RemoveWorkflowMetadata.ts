import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveWorkflowMetadata1762100000000
  implements MigrationInterface
{
  name = 'RemoveWorkflowMetadata1762100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Workflow object names to remove
    const workflowObjects = [
      'workflow',
      'workflowVersion',
      'workflowRun',
      'workflowAutomatedTrigger',
      'workflowEventListener',
    ];

    // Remove cross-references in fieldMetadata table
    await queryRunner.query(
      `
      DELETE FROM "core"."fieldMetadata"
      WHERE "fieldMetadata"."relationObjectMetadataId" IN (
        SELECT "objectMetadata"."id"
        FROM "core"."objectMetadata"
        WHERE "objectMetadata"."nameSingular" = ANY($1)
      )
    `,
      [workflowObjects],
    );

    // Delete indexFieldMetadata records
    await queryRunner.query(
      `
      DELETE FROM "core"."indexFieldMetadata"
      WHERE "indexFieldMetadata"."indexMetadataId" IN (
        SELECT "indexMetadata"."id"
        FROM "core"."indexMetadata"
        WHERE "indexMetadata"."objectMetadataId" IN (
          SELECT "objectMetadata"."id"
          FROM "core"."objectMetadata"
          WHERE "objectMetadata"."nameSingular" = ANY($1)
        )
      )
    `,
      [workflowObjects],
    );

    // Delete indexMetadata records
    await queryRunner.query(
      `
      DELETE FROM "core"."indexMetadata"
      WHERE "indexMetadata"."objectMetadataId" IN (
        SELECT "objectMetadata"."id"
        FROM "core"."objectMetadata"
        WHERE "objectMetadata"."nameSingular" = ANY($1)
      )
    `,
      [workflowObjects],
    );

    // Delete fieldMetadata records
    await queryRunner.query(
      `
      DELETE FROM "core"."fieldMetadata"
      WHERE "fieldMetadata"."objectMetadataId" IN (
        SELECT "objectMetadata"."id"
        FROM "core"."objectMetadata"
        WHERE "objectMetadata"."nameSingular" = ANY($1)
      )
    `,
      [workflowObjects],
    );

    // Delete objectMetadata records
    await queryRunner.query(
      `
      DELETE FROM "core"."objectMetadata"
      WHERE "objectMetadata"."nameSingular" = ANY($1)
    `,
      [workflowObjects],
    );
  }

  public async down(): Promise<void> {
    // This migration is not reversible as the workflow metadata was orphaned
    // and the original data/structure is unknown
  }
}
