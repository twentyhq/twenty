import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789571369002)
export class AddMessageTrackingConsentFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."messageTrackingConsent_decision_enum" AS ENUM('GRANTED', 'DENIED')`,
    );

    await queryRunner.query(
      `CREATE TYPE "core"."messageTrackingConsent_source_enum" AS ENUM('PREFERENCES_PAGE', 'WORKSPACE_MEMBER')`,
    );

    await queryRunner.query(
      `CREATE TABLE "core"."messageTrackingConsent" (
         "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
         "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
         "workspaceId" uuid NOT NULL,
         "emailAddress" character varying NOT NULL,
         "decision" "core"."messageTrackingConsent_decision_enum" NOT NULL,
         "source" "core"."messageTrackingConsent_source_enum" NOT NULL,
         CONSTRAINT "PK_messageTrackingConsent_id" PRIMARY KEY ("id"),
         CONSTRAINT "FK_c0cc212b3fec7ad57847260a8f8" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
       )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_MESSAGE_TRACKING_CONSENT_EMAIL_UNIQUE" ON "core"."messageTrackingConsent" ("workspaceId", "emailAddress")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."messageTrackingConsent"`);

    await queryRunner.query(
      `DROP TYPE "core"."messageTrackingConsent_source_enum"`,
    );

    await queryRunner.query(
      `DROP TYPE "core"."messageTrackingConsent_decision_enum"`,
    );
  }
}
