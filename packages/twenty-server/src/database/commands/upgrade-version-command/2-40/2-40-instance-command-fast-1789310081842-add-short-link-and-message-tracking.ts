import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.40.0', 1789310081842)
export class AddShortLinkAndMessageTrackingFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isMessageTrackingEnabled" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `CREATE TABLE "core"."shortLink" (
         "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
         "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "workspaceId" uuid NOT NULL,
         "messageCampaignId" uuid NOT NULL,
         "authoredUrl" character varying NOT NULL,
         "url" character varying NOT NULL,
         "urlHash" character(64) NOT NULL,
         CONSTRAINT "PK_shortLink_id" PRIMARY KEY ("id"),
         CONSTRAINT "FK_shortLink_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
       )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_SHORT_LINK_URL_UNIQUE" ON "core"."shortLink" ("workspaceId", "messageCampaignId", "urlHash")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_SHORT_LINK_MESSAGE_CAMPAIGN_ID" ON "core"."shortLink" ("workspaceId", "messageCampaignId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."shortLink"`);

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isMessageTrackingEnabled"`,
    );
  }
}
