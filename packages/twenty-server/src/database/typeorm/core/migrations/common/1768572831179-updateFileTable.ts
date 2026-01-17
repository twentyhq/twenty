import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateFileTable1768572831179 implements MigrationInterface {
  name = 'UpdateFileTable1768572831179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "fullPath"`);
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "type"`);
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "path" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "isStaticAsset" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "FK_413aaaf293284c3c0266d0bab3a" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_413aaaf293284c3c0266d0bab3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "isStaticAsset"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "deletedAt"`,
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
