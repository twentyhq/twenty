import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783240670564)
export class AddInstanceFileTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."instanceFile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" text NOT NULL, "size" bigint NOT NULL, "mimeType" character varying NOT NULL DEFAULT \'application/octet-stream\', "applicationRegistrationId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IDX_INSTANCE_FILE_PATH_UNIQUE" UNIQUE ("path"), CONSTRAINT "PK_3d753f7415af93f4dfbd92d58ca" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_INSTANCE_FILE_APPLICATION_REGISTRATION_ID" ON "core"."instanceFile" ("applicationRegistrationId") ');
    await queryRunner.query('ALTER TABLE "core"."instanceFile" ADD CONSTRAINT "FK_19422e6d5c43d71b516c10fe755" FOREIGN KEY ("applicationRegistrationId") REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."instanceFile" DROP CONSTRAINT "FK_19422e6d5c43d71b516c10fe755"');
    await queryRunner.query('DROP INDEX "core"."IDX_INSTANCE_FILE_APPLICATION_REGISTRATION_ID"');
    await queryRunner.query('DROP TABLE "core"."instanceFile"');
  }
}
