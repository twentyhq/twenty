import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentifiersFK1720792873225 implements MigrationInterface {
  name = 'CreateIdentifiersFK1720792873225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "labelIdentifierFieldMetadataId" TYPE uuid USING "labelIdentifierFieldMetadataId"::uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD CONSTRAINT "UQ_aca34aeda432c0e67dd2900ed17" UNIQUE ("labelIdentifierFieldMetadataId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "imageIdentifierFieldMetadataId" TYPE uuid USING "imageIdentifierFieldMetadataId"::uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD CONSTRAINT "UQ_dce04b7b5cc033b3363442e0594" UNIQUE ("imageIdentifierFieldMetadataId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD CONSTRAINT "FK_aca34aeda432c0e67dd2900ed17" FOREIGN KEY ("labelIdentifierFieldMetadataId") REFERENCES "metadata"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD CONSTRAINT "FK_dce04b7b5cc033b3363442e0594" FOREIGN KEY ("imageIdentifierFieldMetadataId") REFERENCES "metadata"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP CONSTRAINT "FK_dce04b7b5cc033b3363442e0594"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP CONSTRAINT "FK_aca34aeda432c0e67dd2900ed17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP CONSTRAINT "UQ_dce04b7b5cc033b3363442e0594"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP CONSTRAINT "UQ_aca34aeda432c0e67dd2900ed17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "labelIdentifierFieldMetadataId" TYPE text USING "labelIdentifierFieldMetadataId"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ALTER COLUMN "imageIdentifierFieldMetadataId" TYPE text USING "imageIdentifierFieldMetadataId"::text`,
    );
  }
}
