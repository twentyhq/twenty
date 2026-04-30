import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WizardStepEntity, WizardProgressEntity, IndustryTemplateEntity, OnboardingChecklistEntity,
  StepStatus, IndustryType, ChecklistItemType,
} from './tenant-wizard.entity';

@Injectable()
export class TenantWizardService {
  private readonly logger = new Logger(TenantWizardService.name);

  constructor(
    @InjectRepository(WizardStepEntity) private readonly stepRepo: Repository<WizardStepEntity>,
    @InjectRepository(WizardProgressEntity) private readonly progressRepo: Repository<WizardProgressEntity>,
    @InjectRepository(IndustryTemplateEntity) private readonly templateRepo: Repository<IndustryTemplateEntity>,
    @InjectRepository(OnboardingChecklistEntity) private readonly checklistRepo: Repository<OnboardingChecklistEntity>,
  ) {}

  async getWizardSteps(workspaceId: string): Promise<WizardStepEntity[]> {
    let steps = await this.stepRepo.find({
      where: { workspaceId },
      order: { order: 'ASC' },
    });

    // Create default steps if none exist
    if (steps.length === 0) {
      const defaultSteps = [
        { name: 'Company Profile', description: 'Set up your company information', category: 'setup', order: 0, isRequired: true, componentKey: 'company-profile', estimatedMinutes: 5 },
        { name: 'Industry Selection', description: 'Choose your industry template', category: 'setup', order: 1, isRequired: true, componentKey: 'industry-select', estimatedMinutes: 2 },
        { name: 'Team Setup', description: 'Invite your team members', category: 'team', order: 2, isRequired: true, componentKey: 'team-invite', estimatedMinutes: 5 },
        { name: 'Pipeline Configuration', description: 'Configure your sales pipeline stages', category: 'config', order: 3, isRequired: true, componentKey: 'pipeline-config', estimatedMinutes: 10 },
        { name: 'Data Import', description: 'Import existing contacts and deals', category: 'data', order: 4, isRequired: false, componentKey: 'data-import', estimatedMinutes: 15 },
        { name: 'Integrations', description: 'Connect your email and calendar', category: 'integrations', order: 5, isRequired: false, componentKey: 'integrations-setup', estimatedMinutes: 10 },
        { name: 'Custom Fields', description: 'Add custom fields for your needs', category: 'config', order: 6, isRequired: false, componentKey: 'custom-fields', estimatedMinutes: 10 },
        { name: 'Review & Launch', description: 'Review your configuration and go live', category: 'launch', order: 7, isRequired: true, componentKey: 'review-launch', estimatedMinutes: 3 },
      ];

      for (const stepData of defaultSteps) {
        steps.push(await this.stepRepo.save(this.stepRepo.create({ workspaceId, ...stepData })));
      }
    }

    return steps;
  }

  async completeStep(workspaceId: string, userId: string, stepId: string, result?: Record<string, string | number | boolean>): Promise<WizardProgressEntity> {
    const step = await this.stepRepo.findOne({ where: { id: stepId, workspaceId } });
    if (!step) throw new NotFoundException(`Step ${stepId} not found`);

    step.status = StepStatus.COMPLETED;
    await this.stepRepo.save(step);

    let progress = await this.progressRepo.findOne({ where: { workspaceId, userId } });
    if (!progress) {
      progress = this.progressRepo.create({ workspaceId, userId });
    }

    const allSteps = await this.stepRepo.find({ where: { workspaceId }, order: { order: 'ASC' } });
    const completedSteps = allSteps.filter((s) => s.status === StepStatus.COMPLETED);

    progress.totalSteps = allSteps.length;
    progress.completedSteps = completedSteps.length;
    progress.progressPercent = Math.round((completedSteps.length / allSteps.length) * 100);
    progress.currentStepOrder = step.order + 1;

    if (result) {
      if (!progress.stepResults) progress.stepResults = {};
      progress.stepResults[stepId] = result;
    }

    if (progress.completedSteps === progress.totalSteps) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      this.logger.log(`Workspace ${workspaceId} completed onboarding wizard`);
    }

    return this.progressRepo.save(progress);
  }

  async selectTemplate(workspaceId: string, userId: string, templateId: string): Promise<IndustryTemplateEntity> {
    const template = await this.templateRepo.findOne({ where: { id: templateId } });
    if (!template) throw new NotFoundException(`Template ${templateId} not found`);

    // Update progress with selected template
    let progress = await this.progressRepo.findOne({ where: { workspaceId, userId } });
    if (!progress) {
      progress = this.progressRepo.create({ workspaceId, userId });
    }
    progress.selectedIndustry = template.industry;
    progress.selectedTemplate = template.name;
    await this.progressRepo.save(progress);

    // Create onboarding checklist from template modules
    if (template.modules) {
      for (let i = 0; i < template.modules.length; i++) {
        await this.checklistRepo.save(this.checklistRepo.create({
          workspaceId,
          title: `Configure ${template.modules[i]}`,
          description: `Set up the ${template.modules[i]} module for your workspace`,
          itemType: ChecklistItemType.RECOMMENDED,
          order: i,
          category: 'module-setup',
          estimatedMinutes: 10,
        }));
      }
    }

    template.usageCount++;
    await this.templateRepo.save(template);

    return template;
  }

  async getProgress(workspaceId: string, userId: string): Promise<{
    progress: WizardProgressEntity | null;
    steps: WizardStepEntity[];
    checklist: OnboardingChecklistEntity[];
  }> {
    const progress = await this.progressRepo.findOne({ where: { workspaceId, userId } });
    const steps = await this.stepRepo.find({ where: { workspaceId }, order: { order: 'ASC' } });
    const checklist = await this.checklistRepo.find({ where: { workspaceId }, order: { order: 'ASC' } });

    return { progress, steps, checklist };
  }

  async generateDemoData(workspaceId: string): Promise<{ generated: boolean; counts: Record<string, number> }> {
    this.logger.log(`Generating demo data for workspace ${workspaceId}`);

    // Create sample templates if none exist
    const existingTemplates = await this.templateRepo.find({ where: { workspaceId } });
    if (existingTemplates.length === 0) {
      const templates = [
        { name: 'Technology SaaS', industry: IndustryType.TECHNOLOGY, modules: ['pipeline', 'accounts', 'contacts', 'deals', 'analytics'], pipelines: [{ name: 'Sales Pipeline', stages: ['Discovery', 'Demo', 'Proposal', 'Negotiation', 'Closed Won'] }] },
        { name: 'Financial Services', industry: IndustryType.FINANCE, modules: ['pipeline', 'accounts', 'compliance', 'portfolios', 'analytics'], pipelines: [{ name: 'Client Pipeline', stages: ['Prospect', 'KYC', 'Proposal', 'Due Diligence', 'Onboarded'] }] },
        { name: 'Healthcare', industry: IndustryType.HEALTHCARE, modules: ['pipeline', 'patients', 'appointments', 'billing', 'compliance'], pipelines: [{ name: 'Patient Pipeline', stages: ['Referral', 'Intake', 'Assessment', 'Treatment', 'Follow-up'] }] },
        { name: 'Retail & E-Commerce', industry: IndustryType.RETAIL, modules: ['pipeline', 'inventory', 'orders', 'customers', 'marketing'], pipelines: [{ name: 'Vendor Pipeline', stages: ['Inquiry', 'Sample', 'Negotiation', 'Contract', 'Active'] }] },
      ];

      for (const t of templates) {
        await this.templateRepo.save(this.templateRepo.create({
          workspaceId,
          name: t.name,
          industry: t.industry,
          modules: t.modules,
          pipelines: t.pipelines,
          isActive: true,
        }));
      }
    }

    return {
      generated: true,
      counts: { templates: 4, steps: 8 },
    };
  }

  async validateConfiguration(workspaceId: string): Promise<{
    isValid: boolean; errors: string[]; warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const steps = await this.stepRepo.find({ where: { workspaceId } });
    const requiredSteps = steps.filter((s) => s.isRequired);
    const incompleteRequired = requiredSteps.filter((s) => s.status !== StepStatus.COMPLETED);

    if (incompleteRequired.length > 0) {
      errors.push(`${incompleteRequired.length} required steps not completed: ${incompleteRequired.map((s) => s.name).join(', ')}`);
    }

    const optionalSteps = steps.filter((s) => !s.isRequired && s.status === StepStatus.PENDING);
    if (optionalSteps.length > 0) {
      warnings.push(`${optionalSteps.length} optional steps skipped: ${optionalSteps.map((s) => s.name).join(', ')}`);
    }

    const checklist = await this.checklistRepo.find({ where: { workspaceId } });
    const incompleteChecklist = checklist.filter((c) => c.itemType === ChecklistItemType.REQUIRED && !c.isCompleted);
    if (incompleteChecklist.length > 0) {
      warnings.push(`${incompleteChecklist.length} checklist items pending`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
