import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795163526357)
export class CreateWebPushSubscriptionCoreTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."webPushSubscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "endpoint" character varying NOT NULL, "browserPublicKey" character varying NOT NULL, "browserAuthSecret" character varying NOT NULL, "vapidPublicKey" character varying NOT NULL, "userSessionId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_56665eaf0faa83047c4c8300285" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_WEB_PUSH_SUBSCRIPTION_USER_SESSION_ID" ON "core"."webPushSubscription" ("userSessionId") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_WEB_PUSH_SUBSCRIPTION_WORKSPACE_ID_ENDPOINT_UNIQUE" ON "core"."webPushSubscription" ("workspaceId", "endpoint") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."webPushSubscription" ADD CONSTRAINT "FK_fbb92c160a36a1ef200bdc882d3" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."webPushSubscription" ADD CONSTRAINT "FK_e5fb7bca454ec469ad0952cf8b4" FOREIGN KEY ("userSessionId") REFERENCES "core"."userSession"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."webPushSubscription" DROP CONSTRAINT "FK_e5fb7bca454ec469ad0952cf8b4"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."webPushSubscription" DROP CONSTRAINT "FK_fbb92c160a36a1ef200bdc882d3"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_WEB_PUSH_SUBSCRIPTION_WORKSPACE_ID_ENDPOINT_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_WEB_PUSH_SUBSCRIPTION_USER_SESSION_ID"',
    );
    await queryRunner.query('DROP TABLE "core"."webPushSubscription"');
  }
}
