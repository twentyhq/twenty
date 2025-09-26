import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationCascade1758883641540 implements MigrationInterface {
  name = 'AddApplicationCascade1758883641540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_259c48f99f625708723414adb5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_62cbd26626ff76df897181c7994" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_62cbd26626ff76df897181c7994"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_259c48f99f625708723414adb5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
