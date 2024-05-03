import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSchemaAndAvailableTablesToServer1714382420165
  implements MigrationInterface
{
  name = 'AddSchemaAndAvailableTablesToServer1714382420165';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" ADD "schema" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" ADD "availableTables" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" DROP COLUMN "availableTables"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" DROP COLUMN "schema"`,
    );
  }
}
