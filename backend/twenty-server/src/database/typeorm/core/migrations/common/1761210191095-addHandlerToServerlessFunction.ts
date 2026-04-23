import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddHandlerToServerlessFunction1761210191095
  implements MigrationInterface
{
  name = 'AddHandlerToServerlessFunction1761210191095';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "handlerPath" character varying NOT NULL DEFAULT 'src/index.ts'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "handlerName" character varying NOT NULL DEFAULT 'main'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "handlerName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "handlerPath"`,
    );
  }
}
