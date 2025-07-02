import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUselessServerlessFunctionColumn1748942397538
  implements MigrationInterface
{
  name = 'RemoveUselessServerlessFunctionColumn1748942397538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "syncStatus"`,
    );

    const metadataSchemaExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.schemata WHERE schema_name = 'metadata';`,
    );

    if (metadataSchemaExists && metadataSchemaExists.length > 0) {
      const potentialTypeNameToMigrate = [
        'dataSource_type_enum',
        'indexMetadata_indextype_enum',
        'relationMetadata_ondeleteaction_enum',
        'serverlessFunction_syncstatus_enum',
      ] as const;

      for (const typeName of potentialTypeNameToMigrate) {
        const selectResult = await queryRunner.query(
          `SELECT true FROM pg_type WHERE typname = '${typeName}' AND typnamespace = 'metadata'::regnamespace`,
        );
        const typeNameExists = selectResult && selectResult.length > 0;

        if (!typeNameExists) {
          continue;
        }

        await queryRunner.query(
          `ALTER TYPE "metadata"."${typeName}" SET SCHEMA "core";`,
        );
      }
    }
    await queryRunner.query(
      `DROP TYPE "core"."serverlessFunction_syncstatus_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."serverlessFunction_syncstatus_enum" AS ENUM('BUILDING', 'NOT_READY', 'READY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "syncStatus" "core"."serverlessFunction_syncstatus_enum" NOT NULL DEFAULT 'NOT_READY'`,
    );
  }
}
