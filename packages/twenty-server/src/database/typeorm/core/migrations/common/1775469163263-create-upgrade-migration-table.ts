import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstanceMigrationTable1775469163263
  implements MigrationInterface
{
  name = 'CreateInstanceMigrationTable1775469163263';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."instanceMigration" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "version" character varying NOT NULL,
        "name" character varying NOT NULL,
        "status" character varying NOT NULL,
        "retry" integer NOT NULL DEFAULT 0,
        "runByVersion" character varying NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_instance_migration_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."instanceMigration"`);
  }
}
