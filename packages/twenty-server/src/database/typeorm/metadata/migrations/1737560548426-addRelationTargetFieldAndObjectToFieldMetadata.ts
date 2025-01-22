import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationTargetFieldAndObjectToFieldMetadata1737560548426 implements MigrationInterface {
    name = 'AddRelationTargetFieldAndObjectToFieldMetadata1737560548426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "metadata"."fieldMetadata" ADD "relationTargetFieldMetadataId" uuid`);
        await queryRunner.query(`ALTER TABLE "metadata"."fieldMetadata" ADD "relationTargetObjectMetadataId" uuid`);
        await queryRunner.query(`ALTER TABLE "metadata"."fieldMetadata" ADD CONSTRAINT "FK_6f6c87ec32cca956d8be321071c" FOREIGN KEY ("relationTargetObjectMetadataId") REFERENCES "metadata"."objectMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "metadata"."fieldMetadata" DROP CONSTRAINT "FK_6f6c87ec32cca956d8be321071c"`);
        await queryRunner.query(`ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "relationTargetObjectMetadataId"`);
        await queryRunner.query(`ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "relationTargetFieldMetadataId"`);
    }

}
