import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesOnFieldMetadataAndIndexFieldMetadata1739203246456
  implements MigrationInterface
{
  name = 'AddIndexesOnFieldMetadataAndIndexMetadata1739203246456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IndexOnFieldMetadataId" ON "metadata"."indexFieldMetadata" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnObjectMetadataId" ON "metadata"."fieldMetadata" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnWorkspaceId" ON "metadata"."fieldMetadata" ("workspaceId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "metadata"."IndexOnWorkspaceId"`);
    await queryRunner.query(`DROP INDEX "metadata"."IndexOnObjectMetadataId"`);
    await queryRunner.query(`DROP INDEX "metadata"."IndexOnFieldMetadataId"`);
  }
}
