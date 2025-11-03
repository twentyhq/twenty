import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class KanbanFieldMetadataIdentifierView1760965667836
  implements MigrationInterface
{
  name = 'KanbanFieldMetadataIdentifierView1760965667836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Swallowing any exceptions here
    // 1-10-clean-orphaned-kanban-aggregate-operation-field-metadata-id.command.ts upgrade command handles fallback for existing workspaces
    try {
      await queryRunner.query(
        `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_b3cc95732479f7a1337350c398f" FOREIGN KEY ("kanbanAggregateOperationFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Swallowing KanbanFieldMetadataIdentifierView1760965667836 error: ${error.message}. Upgrade:1-10:clean-orphaned-kanban-aggregate-operation-field-metadata-id upgrade command will handle fallback`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_b3cc95732479f7a1337350c398f"`,
    );
  }
}
