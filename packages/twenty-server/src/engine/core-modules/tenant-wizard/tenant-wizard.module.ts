import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WizardStepEntity, WizardProgressEntity, IndustryTemplateEntity, OnboardingChecklistEntity } from './tenant-wizard.entity';
import { TenantWizardService } from './tenant-wizard.service';
import { TenantWizardResolver } from './tenant-wizard.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([WizardStepEntity, WizardProgressEntity, IndustryTemplateEntity, OnboardingChecklistEntity])],
  providers: [TenantWizardService, TenantWizardResolver],
  exports: [TenantWizardService],
})
export class TenantWizardModule {}
