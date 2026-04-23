import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';

import { SalesDealBlueprintEntity, type SalesStageRule } from './deal-operations.entity';

const DEFAULT_STAGE_RULES: SalesStageRule[] = [
  { stage: 'prospecting', requiredFields: ['name'], allowedNextStages: ['qualification'] },
  { stage: 'qualification', requiredFields: ['name', 'companyId'], allowedNextStages: ['needs_analysis'] },
  { stage: 'needs_analysis', requiredFields: ['name', 'companyId'], allowedNextStages: ['proposal'] },
  { stage: 'proposal', requiredFields: ['name', 'companyId', 'amount'], allowedNextStages: ['negotiation'] },
  { stage: 'negotiation', requiredFields: ['name', 'companyId', 'amount'], allowedNextStages: ['closed_won', 'closed_lost'] },
  { stage: 'closed_won', requiredFields: ['name', 'companyId', 'amount'] },
  { stage: 'closed_lost', requiredFields: ['name', 'companyId'] },
];

@Injectable()
export class DealOperationsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async cloneOpportunity(
    workspaceId: string,
    opportunityId: string,
    options: {
      name?: string;
      stage?: string;
      closeDate?: Date | null;
      companyId?: string | null;
      pointOfContactId?: string | null;
      ownerId?: string | null;
      amount?: OpportunityWorkspaceEntity['amount'];
      probability?: string;
    } = {},
  ): Promise<OpportunityWorkspaceEntity> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const opportunityRepository =
        await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
          workspaceId,
          'opportunity',
          { shouldBypassPermissionChecks: true },
        );

      const source = await opportunityRepository.findOne({
        where: { id: opportunityId },
      });

      if (!isDefined(source)) {
        throw new NotFoundException(`Opportunity ${opportunityId} not found`);
      }

      const lastPosition = await opportunityRepository.find({
        select: { position: true },
        ...(isDefined(source.companyId)
          ? { where: { companyId: source.companyId } }
          : {}),
        order: { position: 'DESC' },
        take: 1,
      });

      const clonedName = options.name ?? `${source.name} (Copy)`;

      const clonedOpportunity = opportunityRepository.create({
        name: clonedName,
        amount: options.amount ?? source.amount,
        closeDate: options.closeDate ?? source.closeDate,
        stage: options.stage ?? source.stage,
        position: (lastPosition[0]?.position ?? source.position ?? 0) + 1,
        createdBy: source.createdBy,
        updatedBy: source.updatedBy,
        pointOfContactId: options.pointOfContactId ?? source.pointOfContactId,
        companyId: options.companyId ?? source.companyId,
        ownerId: options.ownerId ?? source.ownerId,
        probability: options.probability ?? source.probability,
        searchVector: source.searchVector,
      } as Partial<OpportunityWorkspaceEntity>);

      return opportunityRepository.save(clonedOpportunity);
    }, authContext);
  }

  async createBlueprint(
    workspaceId: string,
    data: Partial<SalesDealBlueprintEntity>,
  ): Promise<SalesDealBlueprintEntity> {
    const blueprintRepository =
      await this.globalWorkspaceOrmManager.getRepository<SalesDealBlueprintEntity>(
        workspaceId,
        SalesDealBlueprintEntity,
        { shouldBypassPermissionChecks: true },
      );

    const blueprint = blueprintRepository.create({
      ...data,
      workspaceId,
      isActive: data.isActive ?? true,
      stageRules: data.stageRules ?? DEFAULT_STAGE_RULES,
      requiredFields: data.requiredFields ?? ['name', 'companyId'],
    });

    return blueprintRepository.save(blueprint);
  }

  async listBlueprints(workspaceId: string): Promise<SalesDealBlueprintEntity[]> {
    const blueprintRepository =
      await this.globalWorkspaceOrmManager.getRepository<SalesDealBlueprintEntity>(
        workspaceId,
        SalesDealBlueprintEntity,
        { shouldBypassPermissionChecks: true },
      );

    return blueprintRepository.find({ where: { workspaceId }, order: { createdAt: 'DESC' } });
  }

  async validateOpportunityAgainstBlueprint(
    workspaceId: string,
    opportunityId: string,
    blueprintId?: string,
  ): Promise<{
    valid: boolean;
    blueprintId: string | null;
    stage: string;
    missingFields: string[];
    allowedNextStages: string[];
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const opportunityRepository =
        await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
          workspaceId,
          'opportunity',
          { shouldBypassPermissionChecks: true },
        );
      const blueprintRepository =
        await this.globalWorkspaceOrmManager.getRepository<SalesDealBlueprintEntity>(
          workspaceId,
          SalesDealBlueprintEntity,
          { shouldBypassPermissionChecks: true },
        );

      const opportunity = await opportunityRepository.findOne({ where: { id: opportunityId } });
      if (!isDefined(opportunity)) {
        throw new NotFoundException(`Opportunity ${opportunityId} not found`);
      }

      const blueprint = isDefined(blueprintId)
        ? await blueprintRepository.findOne({ where: { id: blueprintId, workspaceId } })
        : await blueprintRepository.findOne({ where: { workspaceId, isActive: true } });

      const stageRules = blueprint?.stageRules?.length ? blueprint.stageRules : DEFAULT_STAGE_RULES;
      const currentRule = stageRules.find((rule) => rule.stage === opportunity.stage);
      const missingFields = this.getMissingFields(opportunity, currentRule?.requiredFields ?? []);

      return {
        valid: missingFields.length === 0,
        blueprintId: blueprint?.id ?? null,
        stage: opportunity.stage,
        missingFields,
        allowedNextStages: currentRule?.allowedNextStages ?? [],
      };
    }, authContext);
  }

  async getBlueprintSummary(workspaceId: string): Promise<{
    blueprints: number;
    activeBlueprints: number;
    totalRules: number;
    requiredFields: number;
  }> {
    const blueprints = await this.listBlueprints(workspaceId);

    return {
      blueprints: blueprints.length,
      activeBlueprints: blueprints.filter((blueprint) => blueprint.isActive).length,
      totalRules: blueprints.reduce((sum, blueprint) => sum + (blueprint.stageRules?.length ?? 0), 0),
      requiredFields: new Set(
        blueprints.flatMap((blueprint) => blueprint.requiredFields ?? []),
      ).size,
    };
  }

  async setCompanyParent(
    workspaceId: string,
    companyId: string,
    parentCompanyId: string | null,
  ): Promise<CompanyWorkspaceEntity> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const companyRepository =
        await this.globalWorkspaceOrmManager.getRepository<CompanyWorkspaceEntity>(
          workspaceId,
          'company',
          { shouldBypassPermissionChecks: true },
        );

      const company = await companyRepository.findOne({ where: { id: companyId } });
      if (!isDefined(company)) {
        throw new NotFoundException(`Company ${companyId} not found`);
      }

      if (parentCompanyId && parentCompanyId === companyId) {
        throw new BadRequestException('Company cannot be parent of itself');
      }

      await companyRepository.update(companyId, {
        parentCompanyId,
      } as Partial<CompanyWorkspaceEntity> & { parentCompanyId: string | null });

      const updatedCompany = await companyRepository.findOne({ where: { id: companyId } });
      if (!isDefined(updatedCompany)) {
        throw new NotFoundException(`Company ${companyId} not found after update`);
      }

      return updatedCompany;
    }, authContext);
  }

  private getMissingFields(
    opportunity: OpportunityWorkspaceEntity,
    requiredFields: string[],
  ): string[] {
    const missingFields: string[] = [];

    for (const fieldName of requiredFields) {
      const value = ((opportunity as unknown) as Record<string, unknown>)[fieldName];
      const isEmpty =
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        missingFields.push(fieldName);
      }
    }

    return missingFields;
  }
}
