import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationVariableEntityCoreEntity1760640844181
  implements MigrationInterface
{
  name = 'AddApplicationVariableCoreEntity1760640844181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."applicationVariable" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "value" text NOT NULL DEFAULT '', "description" text NOT NULL DEFAULT '', "isSecret" boolean NOT NULL DEFAULT false, "applicationId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_APPLICATION_VARIABLE_KEY_APPLICATION_ID_UNIQUE" UNIQUE ("key", "applicationId"), CONSTRAINT "PK_62f7823eb5f1e416c9d60614dfb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "FK_51adb49e7f8df35dd23e01c4830" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "FK_51adb49e7f8df35dd23e01c4830"`,
    );
    await queryRunner.query(`DROP TABLE "core"."applicationVariable"`);
  }
}
