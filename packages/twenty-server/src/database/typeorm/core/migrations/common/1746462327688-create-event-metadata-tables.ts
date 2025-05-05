import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventMetadataTables1746462327688 implements MigrationInterface {
    name = 'CreateEventMetadataTables1746462327688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core"."eventMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "strictValidation" boolean NOT NULL DEFAULT false, "validObjectTypes" text, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7762390924658f4d3ad88c45be0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "core"."eventFieldMetadata_fieldtype_enum" AS ENUM('string', 'number', 'boolean', 'object')`);
        await queryRunner.query(`CREATE TABLE "core"."eventFieldMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "fieldType" "core"."eventFieldMetadata_fieldtype_enum" NOT NULL DEFAULT 'string', "isRequired" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "allowedValues" text, "eventMetadataId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cec30ba6808f1b5640030ef5593" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."eventMetadata" ADD CONSTRAINT "FK_e584d68ed4df0ac6a55369e3409" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."eventFieldMetadata" ADD CONSTRAINT "FK_d4bdc96669d719468943da6331d" FOREIGN KEY ("eventMetadataId") REFERENCES "core"."eventMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."eventFieldMetadata" DROP CONSTRAINT "FK_d4bdc96669d719468943da6331d"`);
        await queryRunner.query(`ALTER TABLE "core"."eventMetadata" DROP CONSTRAINT "FK_e584d68ed4df0ac6a55369e3409"`);
        await queryRunner.query(`DROP TABLE "core"."eventFieldMetadata"`);
        await queryRunner.query(`DROP TYPE "core"."eventFieldMetadata_fieldtype_enum"`);
        await queryRunner.query(`DROP TABLE "core"."eventMetadata"`);
    }

}
