import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvitationTable1724056827317 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."invitation"
(
    "id"        uuid                     NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "PK_invitation" PRIMARY KEY ("id")
)`,
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" ADD "invitationId" uuid',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."appToken" ADD CONSTRAINT appToken_invitation_id_fk FOREIGN KEY ("invitationId") REFERENCES "core"."invitation"',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" ALTER COLUMN "userId" DROP NOT NULL',
    );

    await queryRunner.query(
      `ALTER TABLE core."appToken" ADD CONSTRAINT invitationIdNotNullWhenTypeIsInvitation CHECK ("appToken".type != 'INVITATION_TOKEN' OR "appToken"."invitationId" NOTNULL)`,
    );

    await queryRunner.query(
      `ALTER TABLE core."appToken" ADD CONSTRAINT userIdNotNullWhenTypeIsNotInvitation CHECK ("appToken".type = 'INVITATION_TOKEN' OR "appToken"."userId" NOTNULL)`,
    );

    await queryRunner.query('ALTER TABLE core."appToken" ADD "context" jsonb');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "core"."invitation"`);

    await queryRunner.query(
      'ALTER TABLE core."appToken" DROP CONSTRAINT invitationnotnullwhentypeisinvitation',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" DROP CONSTRAINT userIdNotNullWhenTypeIsNotInvitation',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" DROP COLUMN "invitationId"',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" DROP COLUMN "context"',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" ALTER COLUMN "userId" SET NOT NULL',
    );
  }
}
