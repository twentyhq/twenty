import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesOnFieldMetadataAndIndexFieldMetadata1739203246456
  implements MigrationInterface
{
  name = 'AddIndexesOnFieldMetadataAndIndexMetadata1739203246456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IndexOnFieldMetadataId" ON "core"."indexFieldMetadata" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnObjectMetadataId" ON "core"."fieldMetadata" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnWorkspaceId" ON "core"."fieldMetadata" ("workspaceId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IndexOnWorkspaceId"`);
    await queryRunner.query(`DROP INDEX "core"."IndexOnObjectMetadataId"`);
    await queryRunner.query(`DROP INDEX "core"."IndexOnFieldMetadataId"`);
  }
}
