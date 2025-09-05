import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRouteEntity1756803679889 implements MigrationInterface {
  name = 'AddRouteEntity1756803679889';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."route_httpmethod_enum" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."route" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, "isAuthRequired" boolean NOT NULL DEFAULT true, "httpMethod" "core"."route_httpmethod_enum" NOT NULL DEFAULT 'GET', "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "serverlessFunctionId" uuid, CONSTRAINT "IDX_ROUTE_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE" UNIQUE ("path", "httpMethod", "workspaceId"), CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1c39502392dd9cbb186deba158" ON "core"."route" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" ADD CONSTRAINT "FK_c63b1110bbf09051be2f495d0be" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."route" DROP CONSTRAINT "FK_c63b1110bbf09051be2f495d0be"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_1c39502392dd9cbb186deba158"`,
    );
    await queryRunner.query(`DROP TABLE "core"."route"`);
    await queryRunner.query(`DROP TYPE "core"."route_httpmethod_enum"`);
  }
}
