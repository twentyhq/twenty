import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServerlessFunctionLayerVersionColumn1724946099627
  implements MigrationInterface
{
  name = 'AddServerlessFunctionLayerVersionColumn1724946099627';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "layerVersion" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "layerVersion"`,
    );
  }
}
