import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniqueIdentifierToTriggerEntities1756447211845
  implements MigrationInterface
{
  name = 'AddUniqueIdentifierToTriggerEntities1756447211845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_fe492f1ecc81621b6d7cee1775b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8adc1fd6cb0dad2fbfd945954d" ON "core"."cronTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_960465af116edf9ac501bfb3db" ON "core"."databaseEventTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_960465af116edf9ac501bfb3db"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_8adc1fd6cb0dad2fbfd945954d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_fe492f1ecc81621b6d7cee1775b" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
