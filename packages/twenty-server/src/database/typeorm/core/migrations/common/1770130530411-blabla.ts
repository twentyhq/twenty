import { MigrationInterface, QueryRunner } from "typeorm";

export class Blabla1770130530411 implements MigrationInterface {
    name = 'Blabla1770130530411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."application" DROP CONSTRAINT "FK_application_packageJsonFileId"`);
        await queryRunner.query(`ALTER TABLE "core"."application" DROP CONSTRAINT "FK_application_yarnLockFileId"`);
        await queryRunner.query(`ALTER TABLE "core"."application" ADD CONSTRAINT "UQ_3818380258798f9ffa9963b6dc4" UNIQUE ("packageJsonFileId")`);
        await queryRunner.query(`ALTER TABLE "core"."application" ADD CONSTRAINT "UQ_28f20711184b3c3318a8e44d117" UNIQUE ("yarnLockFileId")`);
        await queryRunner.query(`ALTER TABLE "core"."application" ADD CONSTRAINT "FK_3818380258798f9ffa9963b6dc4" FOREIGN KEY ("packageJsonFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."application" ADD CONSTRAINT "FK_28f20711184b3c3318a8e44d117" FOREIGN KEY ("yarnLockFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."application" DROP CONSTRAINT "FK_28f20711184b3c3318a8e44d117"`);
        await queryRunner.query(`ALTER TABLE "core"."application" DROP CONSTRAINT "FK_3818380258798f9ffa9963b6dc4"`);
        await queryRunner.query(`ALTER TABLE "core"."application" DROP CONSTRAINT "UQ_28f20711184b3c3318a8e44d117"`);
        await queryRunner.query(`ALTER TABLE "core"."application" DROP CONSTRAINT "UQ_3818380258798f9ffa9963b6dc4"`);
        await queryRunner.query(`ALTER TABLE "core"."application" ADD CONSTRAINT "FK_application_yarnLockFileId" FOREIGN KEY ("yarnLockFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."application" ADD CONSTRAINT "FK_application_packageJsonFileId" FOREIGN KEY ("packageJsonFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
