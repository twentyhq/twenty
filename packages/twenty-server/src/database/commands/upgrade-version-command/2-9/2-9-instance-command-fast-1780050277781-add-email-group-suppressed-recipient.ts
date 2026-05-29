import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.9.0', 1780050277781)
export class AddEmailGroupSuppressedRecipientFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."emailGroupSuppressedRecipient_scope_enum" AS ENUM(\'GLOBAL\', \'CAMPAIGN\')');
    await queryRunner.query('CREATE TYPE "core"."emailGroupSuppressedRecipient_reason_enum" AS ENUM(\'HARD_BOUNCE\', \'COMPLAINT\', \'UNSUBSCRIBE\')');
    await queryRunner.query('CREATE TYPE "core"."emailGroupSuppressedRecipient_createdbysource_enum" AS ENUM(\'EMAIL\', \'CALENDAR\', \'WORKFLOW\', \'AGENT\', \'API\', \'IMPORT\', \'MANUAL\', \'SYSTEM\', \'WEBHOOK\', \'APPLICATION\')');
    await queryRunner.query('CREATE TABLE "core"."emailGroupSuppressedRecipient" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "emailAddress" character varying NOT NULL, "scope" "core"."emailGroupSuppressedRecipient_scope_enum" NOT NULL, "reason" "core"."emailGroupSuppressedRecipient_reason_enum" NOT NULL, "isSuppressed" boolean NOT NULL DEFAULT true, "providerEventId" character varying, "createdBySource" "core"."emailGroupSuppressedRecipient_createdbysource_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_EMAIL_GROUP_SUPPRESSED_RECIPIENT_WORKSPACE_EMAIL_SCOPE_UNIQUE" UNIQUE ("workspaceId", "emailAddress", "scope"), CONSTRAINT "PK_55b0607e539d7941cbaedf1328a" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "core"."emailGroupSuppressedRecipient" ADD CONSTRAINT "FK_866066f1e73b748f917fd6fcd80" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."emailGroupSuppressedRecipient" DROP CONSTRAINT "FK_866066f1e73b748f917fd6fcd80"');
    await queryRunner.query('DROP TABLE "core"."emailGroupSuppressedRecipient"');
    await queryRunner.query('DROP TYPE "core"."emailGroupSuppressedRecipient_createdbysource_enum"');
    await queryRunner.query('DROP TYPE "core"."emailGroupSuppressedRecipient_reason_enum"');
    await queryRunner.query('DROP TYPE "core"."emailGroupSuppressedRecipient_scope_enum"');
  }
}
