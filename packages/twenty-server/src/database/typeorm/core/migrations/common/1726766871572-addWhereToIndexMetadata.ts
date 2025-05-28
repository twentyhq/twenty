import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhereToIndexMetadata1726766871572
  implements MigrationInterface
{
  name = 'AddWhereToIndexMetadata1726766871572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "indexWhereClause" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "indexWhereClause"`,
    );
  }
}
