import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddBuiltHandlerPathToServerlessFunctions1769016869438
  implements MigrationInterface
{
  name = 'AddBuiltHandlerPathToServerlessFunctions1769016869438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "builtHandlerPath" character varying NOT NULL DEFAULT 'index.mjs'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "builtHandlerPath"`,
    );
  }
}
