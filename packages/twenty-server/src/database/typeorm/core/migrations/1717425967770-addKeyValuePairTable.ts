import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyValuePairTable1717425967770 implements MigrationInterface {
  name = 'AddKeyValuePairTable1717425967770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."keyValuePair" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "workspaceId" uuid, "key" text NOT NULL, "value" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IndexOnKeyUserIdWorkspaceIdUnique" UNIQUE ("key", "userId", "workspaceId"), CONSTRAINT "PK_c5a1ca828435d3eaf8f9361ed4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_0dae35d1c0fbdda6495be4ae71a" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_c137e3d8b3980901e114941daa2" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_c137e3d8b3980901e114941daa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_0dae35d1c0fbdda6495be4ae71a"`,
    );
    await queryRunner.query(`DROP TABLE "core"."keyValuePair"`);
  }
}
