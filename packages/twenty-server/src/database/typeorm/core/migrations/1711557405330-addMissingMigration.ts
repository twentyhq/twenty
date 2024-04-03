import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingMigration1711557405330 implements MigrationInterface {
  name = 'AddMissingMigration1711557405330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_37fdc7357af701e595c5c3a9bd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_cb488f32c6a0827b938edadf221"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "createdAt" SET NOT NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt"::TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "updatedAt" SET NOT NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt"::TIMESTAMP WITH TIME ZONE`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "defaultWorkspaceId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "IndexOnUserIdAndWorkspaceIdUnique" UNIQUE ("userId", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_a2da2ea7d6cd1e5a4c5cb1791f8" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_22f5e76f493c3fb20237cfc48b0" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_22f5e76f493c3fb20237cfc48b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_a2da2ea7d6cd1e5a4c5cb1791f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "IndexOnUserIdAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "defaultWorkspaceId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_cb488f32c6a0827b938edadf221" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_37fdc7357af701e595c5c3a9bd6" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
