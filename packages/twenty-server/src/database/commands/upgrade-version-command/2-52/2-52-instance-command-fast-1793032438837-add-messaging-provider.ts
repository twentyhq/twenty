import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.52.0', 1793032438837)
export class AddMessagingProviderFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."messagingProvider" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "displayName" character varying NOT NULL, "connectionProviderUniversalIdentifier" uuid NOT NULL, "sendMessageLogicFunctionUniversalIdentifier" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_MESSAGING_PROVIDER_NAME_APPLICATION_UNIQUE" UNIQUE ("name", "applicationId"), CONSTRAINT "PK_cf0b52a057bbef9c4975ab083e0" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_cc6e86ea81701c6d48ae239ea0" ON "core"."messagingProvider" ("workspaceId", "universalIdentifier") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_MESSAGING_PROVIDER_APPLICATION_ID" ON "core"."messagingProvider" ("applicationId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messagingProvider" ADD CONSTRAINT "FK_877a5039c291fe9b340d79c84fa" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messagingProvider" ADD CONSTRAINT "FK_6a936124386fc95f14ba5959ff0" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messageChannel" ADD "messagingProviderUniversalIdentifier" uuid',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."messageChannel" DROP COLUMN "messagingProviderUniversalIdentifier"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messagingProvider" DROP CONSTRAINT "FK_6a936124386fc95f14ba5959ff0"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messagingProvider" DROP CONSTRAINT "FK_877a5039c291fe9b340d79c84fa"',
    );
    await queryRunner.query('DROP TABLE "core"."messagingProvider"');
  }
}
