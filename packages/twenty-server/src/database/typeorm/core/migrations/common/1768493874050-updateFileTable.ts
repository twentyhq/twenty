import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateFileTable1768493874050 implements MigrationInterface {
  name = 'UpdateFileTable1768493874050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "fullPath"`);
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "applicationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "path" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "isStaticAsset" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_FILE_WORKSPACE_APPLICATION_PATH" ON "core"."file" ("workspaceId", "applicationId", "path") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "FK_413aaaf293284c3c0266d0bab3a" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_413aaaf293284c3c0266d0bab3a"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FILE_WORKSPACE_APPLICATION_PATH"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "isStaticAsset"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "path"`);
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "fullPath" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "name" character varying NOT NULL`,
    );
  }
}
