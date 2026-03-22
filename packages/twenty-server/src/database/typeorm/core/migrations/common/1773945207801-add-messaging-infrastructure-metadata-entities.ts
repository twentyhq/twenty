import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessagingInfrastructureMetadataEntities1773945207801
  implements MigrationInterface
{
  name = 'AddMessagingInfrastructureMetadataEntities1773945207801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."connectedAccount" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "handle" character varying NOT NULL, "provider" character varying NOT NULL, "accessToken" character varying, "refreshToken" character varying, "lastCredentialsRefreshedAt" TIMESTAMP WITH TIME ZONE, "authFailedAt" TIMESTAMP WITH TIME ZONE, "handleAliases" character varying array, "scopes" character varying array, "connectionParameters" jsonb, "lastSignedInAt" TIMESTAMP WITH TIME ZONE, "oidcTokenClaims" jsonb, "userWorkspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e7a0a0bbc2e06ac2acf89b7f3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageChannel_visibility_enum" AS ENUM('METADATA', 'SUBJECT', 'SHARE_EVERYTHING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageChannel_type_enum" AS ENUM('EMAIL', 'SMS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageChannel_contactautocreationpolicy_enum" AS ENUM('SENT_AND_RECEIVED', 'SENT', 'NONE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageChannel_messagefolderimportpolicy_enum" AS ENUM('ALL_FOLDERS', 'SELECTED_FOLDERS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageChannel_pendinggroupemailsaction_enum" AS ENUM('GROUP_EMAILS_DELETION', 'GROUP_EMAILS_IMPORT', 'NONE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageChannel_syncstatus_enum" AS ENUM('NOT_SYNCED', 'ONGOING', 'ACTIVE', 'FAILED_INSUFFICIENT_PERMISSIONS', 'FAILED_UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageChannel_syncstage_enum" AS ENUM('PENDING_CONFIGURATION', 'MESSAGE_LIST_FETCH_PENDING', 'MESSAGE_LIST_FETCH_SCHEDULED', 'MESSAGE_LIST_FETCH_ONGOING', 'MESSAGES_IMPORT_PENDING', 'MESSAGES_IMPORT_SCHEDULED', 'MESSAGES_IMPORT_ONGOING', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."messageChannel" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "visibility" "core"."messageChannel_visibility_enum" NOT NULL, "handle" character varying NOT NULL, "type" "core"."messageChannel_type_enum" NOT NULL, "isContactAutoCreationEnabled" boolean NOT NULL DEFAULT true, "contactAutoCreationPolicy" "core"."messageChannel_contactautocreationpolicy_enum" NOT NULL DEFAULT 'SENT', "messageFolderImportPolicy" "core"."messageChannel_messagefolderimportpolicy_enum" NOT NULL DEFAULT 'ALL_FOLDERS', "excludeNonProfessionalEmails" boolean NOT NULL DEFAULT true, "excludeGroupEmails" boolean NOT NULL DEFAULT true, "pendingGroupEmailsAction" "core"."messageChannel_pendinggroupemailsaction_enum" NOT NULL, "isSyncEnabled" boolean NOT NULL DEFAULT true, "syncCursor" character varying, "syncedAt" TIMESTAMP WITH TIME ZONE, "syncStatus" "core"."messageChannel_syncstatus_enum" NOT NULL DEFAULT 'NOT_SYNCED', "syncStage" "core"."messageChannel_syncstage_enum" NOT NULL, "syncStageStartedAt" TIMESTAMP WITH TIME ZONE, "throttleFailureCount" integer NOT NULL DEFAULT '0', "throttleRetryAfter" TIMESTAMP WITH TIME ZONE, "connectedAccountId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_438b9412475f39712ed065f77af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."messageFolder_pendingsyncaction_enum" AS ENUM('FOLDER_DELETION', 'NONE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."messageFolder" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "syncCursor" character varying, "isSentFolder" boolean NOT NULL, "isSynced" boolean NOT NULL, "parentFolderId" uuid, "externalId" character varying, "pendingSyncAction" "core"."messageFolder_pendingsyncaction_enum" NOT NULL DEFAULT 'NONE', "messageChannelId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_85cb5a339d9f7f1106dde9e4db8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."calendarChannel_syncstatus_enum" AS ENUM('NOT_SYNCED', 'ONGOING', 'ACTIVE', 'FAILED_INSUFFICIENT_PERMISSIONS', 'FAILED_UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."calendarChannel_syncstage_enum" AS ENUM('PENDING_CONFIGURATION', 'CALENDAR_EVENT_LIST_FETCH_PENDING', 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED', 'CALENDAR_EVENT_LIST_FETCH_ONGOING', 'CALENDAR_EVENTS_IMPORT_PENDING', 'CALENDAR_EVENTS_IMPORT_SCHEDULED', 'CALENDAR_EVENTS_IMPORT_ONGOING', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."calendarChannel_visibility_enum" AS ENUM('METADATA', 'SHARE_EVERYTHING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."calendarChannel_contactautocreationpolicy_enum" AS ENUM('AS_PARTICIPANT_AND_ORGANIZER', 'AS_PARTICIPANT', 'AS_ORGANIZER', 'NONE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."calendarChannel" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "handle" character varying NOT NULL, "syncStatus" "core"."calendarChannel_syncstatus_enum" NOT NULL DEFAULT 'NOT_SYNCED', "syncStage" "core"."calendarChannel_syncstage_enum" NOT NULL, "visibility" "core"."calendarChannel_visibility_enum" NOT NULL, "isContactAutoCreationEnabled" boolean NOT NULL DEFAULT true, "contactAutoCreationPolicy" "core"."calendarChannel_contactautocreationpolicy_enum" NOT NULL DEFAULT 'AS_PARTICIPANT_AND_ORGANIZER', "isSyncEnabled" boolean NOT NULL DEFAULT true, "syncCursor" character varying, "syncedAt" TIMESTAMP WITH TIME ZONE, "syncStageStartedAt" TIMESTAMP WITH TIME ZONE, "throttleFailureCount" integer NOT NULL DEFAULT '0', "connectedAccountId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_796d701c0c35518517d0f3e0e0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" ADD CONSTRAINT "FK_1c7af038a011e99c27044793c6a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" ADD CONSTRAINT "FK_22d9a21a23fdd99295dc0efc177" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" ADD CONSTRAINT "FK_2e966cbb240771c67630d52895c" FOREIGN KEY ("connectedAccountId") REFERENCES "core"."connectedAccount"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ADD CONSTRAINT "FK_e7fb85af997d06d8f7cc7512801" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ADD CONSTRAINT "FK_4237a2fe8a6583354f807c2f8fe" FOREIGN KEY ("messageChannelId") REFERENCES "core"."messageChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."calendarChannel" ADD CONSTRAINT "FK_bb5ebadf91b73c8050fb0a092fa" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."calendarChannel" ADD CONSTRAINT "FK_c7bc368c97a18a072413d67cf45" FOREIGN KEY ("connectedAccountId") REFERENCES "core"."connectedAccount"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."calendarChannel" DROP CONSTRAINT "FK_c7bc368c97a18a072413d67cf45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."calendarChannel" DROP CONSTRAINT "FK_bb5ebadf91b73c8050fb0a092fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" DROP CONSTRAINT "FK_4237a2fe8a6583354f807c2f8fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" DROP CONSTRAINT "FK_e7fb85af997d06d8f7cc7512801"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" DROP CONSTRAINT "FK_2e966cbb240771c67630d52895c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" DROP CONSTRAINT "FK_22d9a21a23fdd99295dc0efc177"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_1c7af038a011e99c27044793c6a"`,
    );
    await queryRunner.query(`DROP TABLE "core"."calendarChannel"`);
    await queryRunner.query(
      `DROP TYPE "core"."calendarChannel_contactautocreationpolicy_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."calendarChannel_visibility_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."calendarChannel_syncstage_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."calendarChannel_syncstatus_enum"`,
    );
    await queryRunner.query(`DROP TABLE "core"."messageFolder"`);
    await queryRunner.query(
      `DROP TYPE "core"."messageFolder_pendingsyncaction_enum"`,
    );
    await queryRunner.query(`DROP TABLE "core"."messageChannel"`);
    await queryRunner.query(`DROP TYPE "core"."messageChannel_syncstage_enum"`);
    await queryRunner.query(
      `DROP TYPE "core"."messageChannel_syncstatus_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."messageChannel_pendinggroupemailsaction_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."messageChannel_messagefolderimportpolicy_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."messageChannel_contactautocreationpolicy_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."messageChannel_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "core"."messageChannel_visibility_enum"`,
    );
    await queryRunner.query(`DROP TABLE "core"."connectedAccount"`);
  }
}
