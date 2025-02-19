import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostgresCredentials1717751631669 implements MigrationInterface {
  name = 'AddPostgresCredentials1717751631669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."postgresCredentials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, CONSTRAINT "PK_3f9c4cdf895bfea0a6ea15bdd81" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."postgresCredentials" ADD CONSTRAINT "FK_9494639abc06f9c8c3691bf5d22" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."postgresCredentials" DROP CONSTRAINT "FK_9494639abc06f9c8c3691bf5d22"`,
    );
    await queryRunner.query(`DROP TABLE "core"."postgresCredentials"`);
  }
}
