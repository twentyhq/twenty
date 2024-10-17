import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConstraintOnIndex1728999374151 implements MigrationInterface {
  name = 'AddConstraintOnIndexMetadata1728999374151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."indexMetadata" ADD CONSTRAINT "IndexOnNameAndWorkspaceIdAndObjectMetadataUnique" UNIQUE ("name", "workspaceId", "objectMetadataId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."indexMetadata" DROP CONSTRAINT "IndexOnNameAndWorkspaceIdAndObjectMetadataUnique"`,
    );
  }
}
