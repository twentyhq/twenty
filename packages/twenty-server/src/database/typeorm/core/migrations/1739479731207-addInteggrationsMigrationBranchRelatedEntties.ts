import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInteggrationsMigrationBranchRelatedEntties1739479731207 implements MigrationInterface {
    name = 'AddInteggrationsMigrationBranchRelatedEntties1739479731207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "core"."keyValuePair_type_enum" AS ENUM('USER_VAR', 'FEATURE_FLAG', 'SYSTEM_VAR')`);
        await queryRunner.query(`CREATE TABLE "core"."keyValuePair" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "workspaceId" uuid, "key" text NOT NULL, "value" jsonb, "textValueDeprecated" text, "type" "core"."keyValuePair_type_enum" NOT NULL DEFAULT 'USER_VAR', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IndexOnKeyUserIdWorkspaceIdUnique" UNIQUE ("key", "userId", "workspaceId"), CONSTRAINT "PK_c5a1ca828435d3eaf8f9361ed4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IndexOnKeyUserIdAndNullWorkspaceIdUnique" ON "core"."keyValuePair" ("key", "userId") WHERE "workspaceId" is NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IndexOnKeyWorkspaceIdAndNullUserIdUnique" ON "core"."keyValuePair" ("key", "workspaceId") WHERE "userId" is NULL`);
        await queryRunner.query(`CREATE TABLE "core"."twoFactorMethod" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userWorkspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_752f0250dd6824289ceddd8b054" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."userWorkspace" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IndexOnUserIdAndWorkspaceIdUnique" UNIQUE ("userId", "workspaceId"), CONSTRAINT "PK_222871f3641385e36e0b9f82aeb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL DEFAULT '', "lastName" character varying NOT NULL DEFAULT '', "email" character varying NOT NULL, "defaultAvatarUrl" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "disabled" boolean NOT NULL DEFAULT false, "passwordHash" character varying, "canImpersonate" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "locale" character varying NOT NULL DEFAULT 'en', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_USER_EMAIL" ON "core"."user" ("email") WHERE "deletedAt" IS NULL`);
        await queryRunner.query(`CREATE TABLE "core"."appToken" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "workspaceId" uuid, "type" text NOT NULL DEFAULT 'REFRESH_TOKEN', "value" text, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "context" jsonb, CONSTRAINT "PK_143bfe36c6284c6d3a52c94741f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."featureFlag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "workspaceId" uuid NOT NULL, "value" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnKeyAndWorkspaceIdUnique" UNIQUE ("key", "workspaceId"), CONSTRAINT "PK_894efa1b1822de801f3b9e04069" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."postgresCredentials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, CONSTRAINT "PK_3f9c4cdf895bfea0a6ea15bdd81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "core"."workspaceSSOIdentityProvider_status_enum" AS ENUM('Active', 'Inactive', 'Error')`);
        await queryRunner.query(`CREATE TYPE "core"."workspaceSSOIdentityProvider_type_enum" AS ENUM('OIDC', 'SAML')`);
        await queryRunner.query(`CREATE TABLE "core"."workspaceSSOIdentityProvider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "status" "core"."workspaceSSOIdentityProvider_status_enum" NOT NULL DEFAULT 'Active', "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "core"."workspaceSSOIdentityProvider_type_enum" NOT NULL DEFAULT 'OIDC', "issuer" character varying NOT NULL, "clientID" character varying, "clientSecret" character varying, "ssoURL" character varying, "certificate" character varying, "fingerprint" character varying, CONSTRAINT "PK_a4e3928eb641e7cd612042b628b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "core"."workspace_activationStatus_enum" AS ENUM('ONGOING_CREATION', 'PENDING_CREATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TABLE "core"."workspace" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "displayName" character varying, "logo" character varying, "inviteHash" character varying, "creatorEmail" character varying, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "allowImpersonation" boolean NOT NULL DEFAULT true, "isPublicInviteLinkEnabled" boolean NOT NULL DEFAULT true, "activationStatus" "core"."workspace_activationStatus_enum" NOT NULL DEFAULT 'INACTIVE', "metadataVersion" integer NOT NULL DEFAULT '1', "databaseUrl" character varying NOT NULL DEFAULT '', "databaseSchema" character varying NOT NULL DEFAULT '', "subdomain" character varying NOT NULL, "hostname" character varying, "isGoogleAuthEnabled" boolean NOT NULL DEFAULT true, "isPasswordAuthEnabled" boolean NOT NULL DEFAULT true, "isMicrosoftAuthEnabled" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_cba6255a24deb1fff07dd7351b8" UNIQUE ("subdomain"), CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0" UNIQUE ("hostname"), CONSTRAINT "PK_ca86b6f9b3be5fe26d307d09b49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."telephony" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "memberId" character varying NOT NULL DEFAULT '', "numberExtension" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying DEFAULT '', "extensionName" character varying DEFAULT '', "extensionGroup" character varying DEFAULT '', "dialingPlan" character varying DEFAULT '', "areaCode" character varying DEFAULT '', "SIPPassword" character varying DEFAULT '', "callerExternalID" character varying DEFAULT '', "pullCalls" character varying DEFAULT '', "listenToCalls" boolean DEFAULT false, "recordCalls" boolean DEFAULT false, "blockExtension" boolean DEFAULT false, "enableMailbox" boolean DEFAULT false, "emailForMailbox" character varying DEFAULT '', "fowardAllCalls" character varying DEFAULT '', "fowardBusyNotAvailable" character varying DEFAULT '', "fowardOfflineWithoutService" character varying DEFAULT '', "extensionAllCallsOrOffline" character varying DEFAULT '', "externalNumberAllCallsOrOffline" character varying DEFAULT '', "destinyMailboxAllCallsOrOffline" character varying DEFAULT '', "extensionBusy" character varying DEFAULT '', "externalNumberBusy" character varying DEFAULT '', "destinyMailboxBusy" character varying DEFAULT '', "ramal_id" character varying DEFAULT '', "advancedFowarding1" character varying DEFAULT '', "advancedFowarding2" character varying DEFAULT '', "advancedFowarding3" character varying DEFAULT '', "advancedFowarding4" character varying DEFAULT '', "advancedFowarding5" character varying DEFAULT '', "advancedFowarding1Value" character varying DEFAULT '', "advancedFowarding2Value" character varying DEFAULT '', "advancedFowarding3Value" character varying DEFAULT '', "advancedFowarding4Value" character varying DEFAULT '', "advancedFowarding5Value" character varying DEFAULT '', "workspaceId" uuid, CONSTRAINT "UQ_7d63a6aaa99acb4fb9c4773d0a5" UNIQUE ("memberId"), CONSTRAINT "UQ_dd1f243a489880fcddf0b592c08" UNIQUE ("numberExtension"), CONSTRAINT "PK_f380a6d1e8ff45b6562fdaa17c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."whatsappIntegration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "phoneId" character varying NOT NULL, "businessAccountId" character varying NOT NULL, "appId" character varying NOT NULL, "appKey" character varying NOT NULL, "accessToken" character varying NOT NULL, "verifyToken" character varying NOT NULL, "disabled" boolean NOT NULL DEFAULT false, "sla" integer NOT NULL DEFAULT '30', "workspaceId" uuid, CONSTRAINT "PK_39f3dbc97ba512ae7733c5e313d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "core"."inbox_integrationtype_enum" AS ENUM('whatsapp', 'messenger')`);
        await queryRunner.query(`CREATE TABLE "core"."inbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "integrationType" "core"."inbox_integrationtype_enum" NOT NULL DEFAULT 'whatsapp', "whatsappIntegrationId" uuid, "workspaceId" uuid, CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."agent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "memberId" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid, CONSTRAINT "PK_1000e989398c5d4ed585cf9a46f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."sector" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "icon" character varying NOT NULL DEFAULT '', "name" character varying NOT NULL, "topics" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid, CONSTRAINT "PK_668b2ea8a2f534425407732f3ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."agentSectors" ("agentId" uuid NOT NULL, "sectorId" uuid NOT NULL, CONSTRAINT "PK_0c18c8b27732410238951935921" PRIMARY KEY ("agentId", "sectorId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1881105c19d856bd8a6584927d" ON "core"."agentSectors" ("agentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_38087e38dbfd5622ef7c25b6da" ON "core"."agentSectors" ("sectorId") `);
        await queryRunner.query(`CREATE TABLE "core"."agentInboxes" ("agentId" uuid NOT NULL, "inboxId" uuid NOT NULL, CONSTRAINT "PK_5dfa966345cd5bdff1a46baa3eb" PRIMARY KEY ("agentId", "inboxId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_026ec88fe86e63746eff660903" ON "core"."agentInboxes" ("agentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8f880c98aefa6e4d00b22312df" ON "core"."agentInboxes" ("inboxId") `);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_0dae35d1c0fbdda6495be4ae71a" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_c137e3d8b3980901e114941daa2" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."twoFactorMethod" ADD CONSTRAINT "FK_c1044145be65a4ee65c07e0a658" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_a2da2ea7d6cd1e5a4c5cb1791f8" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_22f5e76f493c3fb20237cfc48b0" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_8cd4819144baf069777b5729136" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."featureFlag" ADD CONSTRAINT "FK_6be7761fa8453f3a498aab6e72b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."postgresCredentials" ADD CONSTRAINT "FK_9494639abc06f9c8c3691bf5d22" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "FK_bc8d8855198de1fbc32fba8df93" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."telephony" ADD CONSTRAINT "FK_37d14bf27d627391ae02a396238" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."whatsappIntegration" ADD CONSTRAINT "FK_e9186ae8c5e97e8ad19d0e23365" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" ADD CONSTRAINT "FK_8c2ae450d5b70eaa1a1af61b1f2" FOREIGN KEY ("whatsappIntegrationId") REFERENCES "core"."whatsappIntegration"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" ADD CONSTRAINT "FK_1b1e0eb2a0d0ca0a6e822685135" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."sector" ADD CONSTRAINT "FK_dfc8d6ca50978b7070e4fd0bc5f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" ADD CONSTRAINT "FK_1881105c19d856bd8a6584927df" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" ADD CONSTRAINT "FK_38087e38dbfd5622ef7c25b6dae" FOREIGN KEY ("sectorId") REFERENCES "core"."sector"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" ADD CONSTRAINT "FK_026ec88fe86e63746eff660903e" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" ADD CONSTRAINT "FK_8f880c98aefa6e4d00b22312df2" FOREIGN KEY ("inboxId") REFERENCES "core"."inbox"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" DROP CONSTRAINT "FK_8f880c98aefa6e4d00b22312df2"`);
        await queryRunner.query(`ALTER TABLE "core"."agentInboxes" DROP CONSTRAINT "FK_026ec88fe86e63746eff660903e"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" DROP CONSTRAINT "FK_38087e38dbfd5622ef7c25b6dae"`);
        await queryRunner.query(`ALTER TABLE "core"."agentSectors" DROP CONSTRAINT "FK_1881105c19d856bd8a6584927df"`);
        await queryRunner.query(`ALTER TABLE "core"."sector" DROP CONSTRAINT "FK_dfc8d6ca50978b7070e4fd0bc5f"`);
        await queryRunner.query(`ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1"`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" DROP CONSTRAINT "FK_1b1e0eb2a0d0ca0a6e822685135"`);
        await queryRunner.query(`ALTER TABLE "core"."inbox" DROP CONSTRAINT "FK_8c2ae450d5b70eaa1a1af61b1f2"`);
        await queryRunner.query(`ALTER TABLE "core"."whatsappIntegration" DROP CONSTRAINT "FK_e9186ae8c5e97e8ad19d0e23365"`);
        await queryRunner.query(`ALTER TABLE "core"."telephony" DROP CONSTRAINT "FK_37d14bf27d627391ae02a396238"`);
        await queryRunner.query(`ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP CONSTRAINT "FK_bc8d8855198de1fbc32fba8df93"`);
        await queryRunner.query(`ALTER TABLE "core"."postgresCredentials" DROP CONSTRAINT "FK_9494639abc06f9c8c3691bf5d22"`);
        await queryRunner.query(`ALTER TABLE "core"."featureFlag" DROP CONSTRAINT "FK_6be7761fa8453f3a498aab6e72b"`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772"`);
        await queryRunner.query(`ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_8cd4819144baf069777b5729136"`);
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_22f5e76f493c3fb20237cfc48b0"`);
        await queryRunner.query(`ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_a2da2ea7d6cd1e5a4c5cb1791f8"`);
        await queryRunner.query(`ALTER TABLE "core"."twoFactorMethod" DROP CONSTRAINT "FK_c1044145be65a4ee65c07e0a658"`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_c137e3d8b3980901e114941daa2"`);
        await queryRunner.query(`ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_0dae35d1c0fbdda6495be4ae71a"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_8f880c98aefa6e4d00b22312df"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_026ec88fe86e63746eff660903"`);
        await queryRunner.query(`DROP TABLE "core"."agentInboxes"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_38087e38dbfd5622ef7c25b6da"`);
        await queryRunner.query(`DROP INDEX "core"."IDX_1881105c19d856bd8a6584927d"`);
        await queryRunner.query(`DROP TABLE "core"."agentSectors"`);
        await queryRunner.query(`DROP TABLE "core"."sector"`);
        await queryRunner.query(`DROP TABLE "core"."agent"`);
        await queryRunner.query(`DROP TABLE "core"."inbox"`);
        await queryRunner.query(`DROP TYPE "core"."inbox_integrationtype_enum"`);
        await queryRunner.query(`DROP TABLE "core"."whatsappIntegration"`);
        await queryRunner.query(`DROP TABLE "core"."telephony"`);
        await queryRunner.query(`DROP TABLE "core"."workspace"`);
        await queryRunner.query(`DROP TYPE "core"."workspace_activationStatus_enum"`);
        await queryRunner.query(`DROP TABLE "core"."workspaceSSOIdentityProvider"`);
        await queryRunner.query(`DROP TYPE "core"."workspaceSSOIdentityProvider_type_enum"`);
        await queryRunner.query(`DROP TYPE "core"."workspaceSSOIdentityProvider_status_enum"`);
        await queryRunner.query(`DROP TABLE "core"."postgresCredentials"`);
        await queryRunner.query(`DROP TABLE "core"."featureFlag"`);
        await queryRunner.query(`DROP TABLE "core"."appToken"`);
        await queryRunner.query(`DROP INDEX "core"."UQ_USER_EMAIL"`);
        await queryRunner.query(`DROP TABLE "core"."user"`);
        await queryRunner.query(`DROP TABLE "core"."userWorkspace"`);
        await queryRunner.query(`DROP TABLE "core"."twoFactorMethod"`);
        await queryRunner.query(`DROP INDEX "core"."IndexOnKeyWorkspaceIdAndNullUserIdUnique"`);
        await queryRunner.query(`DROP INDEX "core"."IndexOnKeyUserIdAndNullWorkspaceIdUnique"`);
        await queryRunner.query(`DROP TABLE "core"."keyValuePair"`);
        await queryRunner.query(`DROP TYPE "core"."keyValuePair_type_enum"`);
    }

}
