import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRelationMetadataV21737037997641 implements MigrationInterface {
    name = 'CreateRelationMetadataV21737037997641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "metadata"."relationMetadataV2_ondeleteaction_enum" AS ENUM('CASCADE', 'RESTRICT', 'SET_NULL', 'NO_ACTION')`);
        await queryRunner.query(`CREATE TABLE "metadata"."relationMetadataV2" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "relationType" character varying NOT NULL, "onDeleteAction" "metadata"."relationMetadataV2_ondeleteaction_enum" NOT NULL DEFAULT 'SET_NULL', "workspaceId" uuid NOT NULL, "sourceObjectMetadataId" uuid NOT NULL, "targetObjectMetadataId" uuid NOT NULL, "sourceFieldMetadataId" uuid NOT NULL, "targetFieldMetadataId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_c73d1e4657f79a6ec346e00916" UNIQUE ("sourceFieldMetadataId"), CONSTRAINT "REL_74afbb10c407038ec790eb5f8e" UNIQUE ("targetFieldMetadataId"), CONSTRAINT "PK_46973b622a2907b5a9a2d3f3db8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" ADD CONSTRAINT "FK_b8d118784925dd93b98061e5895" FOREIGN KEY ("sourceObjectMetadataId") REFERENCES "metadata"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" ADD CONSTRAINT "FK_20dc31a0ab67d179f8e6c159f7a" FOREIGN KEY ("targetObjectMetadataId") REFERENCES "metadata"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" ADD CONSTRAINT "FK_c73d1e4657f79a6ec346e00916b" FOREIGN KEY ("sourceFieldMetadataId") REFERENCES "metadata"."fieldMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" ADD CONSTRAINT "FK_74afbb10c407038ec790eb5f8e5" FOREIGN KEY ("targetFieldMetadataId") REFERENCES "metadata"."fieldMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" DROP CONSTRAINT "FK_74afbb10c407038ec790eb5f8e5"`);
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" DROP CONSTRAINT "FK_c73d1e4657f79a6ec346e00916b"`);
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" DROP CONSTRAINT "FK_20dc31a0ab67d179f8e6c159f7a"`);
        await queryRunner.query(`ALTER TABLE "metadata"."relationMetadataV2" DROP CONSTRAINT "FK_b8d118784925dd93b98061e5895"`);
        await queryRunner.query(`DROP TABLE "metadata"."relationMetadataV2"`);
        await queryRunner.query(`DROP TYPE "metadata"."relationMetadataV2_ondeleteaction_enum"`);
    }

}
