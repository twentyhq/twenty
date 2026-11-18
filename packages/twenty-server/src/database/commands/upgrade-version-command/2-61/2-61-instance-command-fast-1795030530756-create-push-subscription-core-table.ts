import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795030530756)
export class CreatePushSubscriptionCoreTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."pushSubscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "endpoint" character varying NOT NULL, "p256dhKey" character varying NOT NULL, "authSecret" character varying NOT NULL, "applicationServerKey" character varying NOT NULL, "userSessionId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2bd6fe3a45ade38e77e1a7db7b5" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_PUSH_SUBSCRIPTION_USER_SESSION_ID" ON "core"."pushSubscription" ("userSessionId") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_PUSH_SUBSCRIPTION_WORKSPACE_ID_ENDPOINT_UNIQUE" ON "core"."pushSubscription" ("workspaceId", "endpoint") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pushSubscription" ADD CONSTRAINT "FK_18b170be9633c6d6a6cd4d4a182" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pushSubscription" ADD CONSTRAINT "FK_9a866f582f65d4e4a54d8d07b6f" FOREIGN KEY ("userSessionId") REFERENCES "core"."userSession"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."pushSubscription" DROP CONSTRAINT "FK_9a866f582f65d4e4a54d8d07b6f"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pushSubscription" DROP CONSTRAINT "FK_18b170be9633c6d6a6cd4d4a182"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_PUSH_SUBSCRIPTION_WORKSPACE_ID_ENDPOINT_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_PUSH_SUBSCRIPTION_USER_SESSION_ID"',
    );
    await queryRunner.query('DROP TABLE "core"."pushSubscription"');
  }
}
