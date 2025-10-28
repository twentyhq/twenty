import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class SetServerlessFunctionLayerIdNotNullable1761153071116
  implements MigrationInterface
{
  name = 'SetServerlessFunctionLayerIdNotNullable1761153071116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "serverlessFunctionLayerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514" FOREIGN KEY ("serverlessFunctionLayerId") REFERENCES "core"."serverlessFunctionLayer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "serverlessFunctionLayerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514" FOREIGN KEY ("serverlessFunctionLayerId") REFERENCES "core"."serverlessFunctionLayer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
