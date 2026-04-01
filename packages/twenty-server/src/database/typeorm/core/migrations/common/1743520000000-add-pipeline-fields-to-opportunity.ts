import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPipelineFieldsToOpportunity1743520000000 implements MigrationInterface {
  name = 'AddPipelineFieldsToOpportunity1743520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "stage" ADD VALUE IF NOT EXISTS 'NEW';
      ALTER TYPE "stage" ADD VALUE IF NOT EXISTS 'SCREENING';
      ALTER TYPE "stage" ADD VALUE IF NOT EXISTS 'MEETING';
      ALTER TYPE "stage" ADD VALUE IF NOT EXISTS 'PROPOSAL';
      ALTER TYPE "stage" ADD VALUE IF NOT EXISTS 'CUSTOMER';
      ALTER TYPE "stage" ADD VALUE IF NOT EXISTS 'WON';
      ALTER TYPE "stage" ADD VALUE IF NOT EXISTS 'LOST';
    `);

    await queryRunner.query(`
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'WEBSITE';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'REFERRAL';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'COLD_OUTBOUND';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'WARM_OUTBOUND';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'SOCIAL_MEDIA';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'EVENT';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'PARTNER';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'ADVERTISING';
      ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'OTHER';
    `);

    await queryRunner.query(`
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'NO_BUDGET';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'NO_NEED';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'COMPETITOR';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'PRICING';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'TIMING';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'LOST_CONTACT';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'TECHNICAL_ISSUES';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'LEGAL_ISSUES';
      ALTER TYPE "lost_reason" ADD VALUE IF NOT EXISTS 'OTHER';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
