import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntegrationsMigrationBranchEntities1739563469632
  implements MigrationInterface
{
  name = 'AddIntegrationsMigrationBranchEntities1739563469632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."telephony" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "memberId" character varying NOT NULL DEFAULT '', "numberExtension" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying DEFAULT '', "extensionName" character varying DEFAULT '', "extensionGroup" character varying DEFAULT '', "dialingPlan" character varying DEFAULT '', "areaCode" character varying DEFAULT '', "SIPPassword" character varying DEFAULT '', "callerExternalID" character varying DEFAULT '', "pullCalls" character varying DEFAULT '', "listenToCalls" boolean DEFAULT false, "recordCalls" boolean DEFAULT false, "blockExtension" boolean DEFAULT false, "enableMailbox" boolean DEFAULT false, "emailForMailbox" character varying DEFAULT '', "fowardAllCalls" character varying DEFAULT '', "fowardBusyNotAvailable" character varying DEFAULT '', "fowardOfflineWithoutService" character varying DEFAULT '', "extensionAllCallsOrOffline" character varying DEFAULT '', "externalNumberAllCallsOrOffline" character varying DEFAULT '', "destinyMailboxAllCallsOrOffline" character varying DEFAULT '', "extensionBusy" character varying DEFAULT '', "externalNumberBusy" character varying DEFAULT '', "destinyMailboxBusy" character varying DEFAULT '', "ramal_id" character varying DEFAULT '', "advancedFowarding1" character varying DEFAULT '', "advancedFowarding2" character varying DEFAULT '', "advancedFowarding3" character varying DEFAULT '', "advancedFowarding4" character varying DEFAULT '', "advancedFowarding5" character varying DEFAULT '', "advancedFowarding1Value" character varying DEFAULT '', "advancedFowarding2Value" character varying DEFAULT '', "advancedFowarding3Value" character varying DEFAULT '', "advancedFowarding4Value" character varying DEFAULT '', "advancedFowarding5Value" character varying DEFAULT '', "workspaceId" uuid, CONSTRAINT "UQ_7d63a6aaa99acb4fb9c4773d0a5" UNIQUE ("memberId"), CONSTRAINT "UQ_dd1f243a489880fcddf0b592c08" UNIQUE ("numberExtension"), CONSTRAINT "PK_f380a6d1e8ff45b6562fdaa17c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."whatsappIntegration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "phoneId" character varying NOT NULL, "businessAccountId" character varying NOT NULL, "appId" character varying NOT NULL, "appKey" character varying NOT NULL, "accessToken" character varying NOT NULL, "verifyToken" character varying NOT NULL, "disabled" boolean NOT NULL DEFAULT false, "sla" integer NOT NULL DEFAULT '30', "workspaceId" uuid, CONSTRAINT "PK_39f3dbc97ba512ae7733c5e313d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."inbox_integrationtype_enum" AS ENUM('whatsapp', 'messenger')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."inbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "integrationType" "core"."inbox_integrationtype_enum" NOT NULL DEFAULT 'whatsapp', "whatsappIntegrationId" uuid, "workspaceId" uuid, CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."workspaceAgent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "memberId" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid, CONSTRAINT "PK_1000e989398c5d4ed585cf9a46f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."sector" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "icon" character varying NOT NULL DEFAULT '', "name" character varying NOT NULL, "topics" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid, CONSTRAINT "PK_668b2ea8a2f534425407732f3ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentSectors" ("agentId" uuid NOT NULL, "sectorId" uuid NOT NULL, CONSTRAINT "PK_0c18c8b27732410238951935921" PRIMARY KEY ("agentId", "sectorId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1881105c19d856bd8a6584927d" ON "core"."agentSectors" ("agentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38087e38dbfd5622ef7c25b6da" ON "core"."agentSectors" ("sectorId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentInboxes" ("agentId" uuid NOT NULL, "inboxId" uuid NOT NULL, CONSTRAINT "PK_5dfa966345cd5bdff1a46baa3eb" PRIMARY KEY ("agentId", "inboxId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_026ec88fe86e63746eff660903" ON "core"."agentInboxes" ("agentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f880c98aefa6e4d00b22312df" ON "core"."agentInboxes" ("inboxId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."telephony" ADD CONSTRAINT "FK_37d14bf27d627391ae02a396238" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."whatsappIntegration" ADD CONSTRAINT "FK_e9186ae8c5e97e8ad19d0e23365" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inbox" ADD CONSTRAINT "FK_8c2ae450d5b70eaa1a1af61b1f2" FOREIGN KEY ("whatsappIntegrationId") REFERENCES "core"."whatsappIntegration"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inbox" ADD CONSTRAINT "FK_1b1e0eb2a0d0ca0a6e822685135" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceAgent" ADD CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."sector" ADD CONSTRAINT "FK_dfc8d6ca50978b7070e4fd0bc5f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentSectors" ADD CONSTRAINT "FK_1881105c19d856bd8a6584927df" FOREIGN KEY ("agentId") REFERENCES "core"."workspaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentSectors" ADD CONSTRAINT "FK_38087e38dbfd5622ef7c25b6dae" FOREIGN KEY ("sectorId") REFERENCES "core"."sector"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentInboxes" ADD CONSTRAINT "FK_026ec88fe86e63746eff660903e" FOREIGN KEY ("agentId") REFERENCES "core"."workspaceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentInboxes" ADD CONSTRAINT "FK_8f880c98aefa6e4d00b22312df2" FOREIGN KEY ("inboxId") REFERENCES "core"."inbox"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentInboxes" DROP CONSTRAINT "FK_8f880c98aefa6e4d00b22312df2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentInboxes" DROP CONSTRAINT "FK_026ec88fe86e63746eff660903e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentSectors" DROP CONSTRAINT "FK_38087e38dbfd5622ef7c25b6dae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentSectors" DROP CONSTRAINT "FK_1881105c19d856bd8a6584927df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."sector" DROP CONSTRAINT "FK_dfc8d6ca50978b7070e4fd0bc5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceAgent" DROP CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inbox" DROP CONSTRAINT "FK_1b1e0eb2a0d0ca0a6e822685135"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inbox" DROP CONSTRAINT "FK_8c2ae450d5b70eaa1a1af61b1f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."whatsappIntegration" DROP CONSTRAINT "FK_e9186ae8c5e97e8ad19d0e23365"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."telephony" DROP CONSTRAINT "FK_37d14bf27d627391ae02a396238"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_8f880c98aefa6e4d00b22312df"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_026ec88fe86e63746eff660903"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentInboxes"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_38087e38dbfd5622ef7c25b6da"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_1881105c19d856bd8a6584927d"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentSectors"`);
    await queryRunner.query(`DROP TABLE "core"."sector"`);
    await queryRunner.query(`DROP TABLE "core"."workspaceAgent"`);
    await queryRunner.query(`DROP TABLE "core"."inbox"`);
    await queryRunner.query(`DROP TYPE "core"."inbox_integrationtype_enum"`);
    await queryRunner.query(`DROP TABLE "core"."whatsappIntegration"`);
    await queryRunner.query(`DROP TABLE "core"."telephony"`);
  }
}
