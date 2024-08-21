import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntroduceMetadataVersionAndDatasourceOnWorkspace1724173430043
  implements MigrationInterface
{
  name = 'IntroduceMetadataVersionAndDatasourceOnWorkspace1724173430043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "metadataVersion" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "databaseUrl" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "databaseSchema" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "databaseSchema"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "databaseUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "metadataVersion"`,
    );
  }
}
