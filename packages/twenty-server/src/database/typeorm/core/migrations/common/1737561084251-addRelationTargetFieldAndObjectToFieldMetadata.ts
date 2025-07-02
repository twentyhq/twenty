import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationTargetFieldAndObjectToFieldMetadata1737561084251
  implements MigrationInterface
{
  name = 'AddRelationTargetFieldAndObjectToFieldMetadata1737561084251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "relationTargetFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "UQ_47a6c57e1652b6475f8248cff78" UNIQUE ("relationTargetFieldMetadataId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "relationTargetObjectMetadataId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnRelationTargetObjectMetadataId" ON "core"."fieldMetadata" ("relationTargetObjectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IndexOnRelationTargetFieldMetadataId" ON "core"."fieldMetadata" ("relationTargetFieldMetadataId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_47a6c57e1652b6475f8248cff78" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_6f6c87ec32cca956d8be321071c" FOREIGN KEY ("relationTargetObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_6f6c87ec32cca956d8be321071c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_47a6c57e1652b6475f8248cff78"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnRelationTargetFieldMetadataId"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnRelationTargetObjectMetadataId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "relationTargetObjectMetadataId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "UQ_47a6c57e1652b6475f8248cff78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "relationTargetFieldMetadataId"`,
    );
  }
}
