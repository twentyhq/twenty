import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameHandlerPathToSourceHandlerPath1769091641000
  implements MigrationInterface
{
  name = 'RenameHandlerPathToSourceHandlerPath1769091641000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" RENAME COLUMN "handlerPath" TO "sourceHandlerPath"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" RENAME COLUMN "sourceHandlerPath" TO "handlerPath"`,
    );
  }
}
