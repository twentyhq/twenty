import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataHygieneAgent, DataHygieneStatus, DataQualityIssue } from './data-hygiene-agent.entity';

@Injectable()
export class DataHygieneAgentService {
  constructor(
    @InjectRepository(DataHygieneAgent, 'core')
    private readonly agentRepo: Repository<DataHygieneAgent>,
    @InjectRepository(DataQualityIssue, 'core')
    private readonly issueRepo: Repository<DataQualityIssue>,
  ) {}

  async findAll(workspaceId: string): Promise<DataHygieneAgent[]> {
    return this.agentRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<DataHygieneAgent | null> {
    return this.agentRepo.findOne({ where: { id, workspaceId } });
  }

  async create(
    workspaceId: string,
    data: Partial<DataHygieneAgent> & { name: string },
  ): Promise<DataHygieneAgent> {
    const agent = this.agentRepo.create({
      ...data,
      workspaceId,
      status: data.status ?? DataHygieneStatus.PAUSED,
      duplicateDetectionEnabled: data.duplicateDetectionEnabled ?? true,
      autoEnrichmentEnabled: data.autoEnrichmentEnabled ?? true,
      dataNormalizationEnabled: data.dataNormalizationEnabled ?? true,
      autoMergeEnabled: data.autoMergeEnabled ?? false,
      duplicatesDetectedCount: data.duplicatesDetectedCount ?? 0,
      duplicatesMergedCount: data.duplicatesMergedCount ?? 0,
      fieldsEnrichedCount: data.fieldsEnrichedCount ?? 0,
      recordsCleanedCount: data.recordsCleanedCount ?? 0,
    });

    return this.agentRepo.save(agent);
  }

  async update(id: string, workspaceId: string, data: Partial<DataHygieneAgent>): Promise<DataHygieneAgent> {
    await this.agentRepo.update({ id, workspaceId }, data as never);
    const agent = await this.findOne(id, workspaceId);
    if (!agent) throw new NotFoundException(`Data hygiene agent ${id} not found`);
    return agent;
  }

  async start(id: string, workspaceId: string): Promise<DataHygieneAgent> {
    return this.update(id, workspaceId, { status: DataHygieneStatus.ACTIVE, lastRunAt: new Date() });
  }

  async pause(id: string, workspaceId: string): Promise<DataHygieneAgent> {
    return this.update(id, workspaceId, { status: DataHygieneStatus.PAUSED });
  }

  async stop(id: string, workspaceId: string): Promise<DataHygieneAgent> {
    return this.update(id, workspaceId, { status: DataHygieneStatus.STOPPED });
  }

  async recordIssue(
    workspaceId: string,
    data: {
      entityType: string;
      entityId: string;
      issueType: string;
      description?: string;
      suggestedFix?: Record<string, unknown>;
    },
  ): Promise<DataQualityIssue> {
    const issue = this.issueRepo.create({
      workspaceId,
      entityType: data.entityType,
      entityId: data.entityId,
      issueType: data.issueType,
      description: data.description ?? null,
      suggestedFix: data.suggestedFix ?? null,
      isResolved: false,
    });

    return this.issueRepo.save(issue);
  }

  async scanRecord(
    workspaceId: string,
    entityType: string,
    entityId: string,
    record: Record<string, unknown>,
  ): Promise<DataQualityIssue[]> {
    const issues: Array<{
      entityType: string;
      entityId: string;
      issueType: string;
      description?: string;
      suggestedFix?: Record<string, unknown>;
    }> = [];

    for (const [field, value] of Object.entries(record)) {
      if (value === null || value === undefined) {
        issues.push({
          entityType,
          entityId,
          issueType: 'missing_field',
          description: `Field ${field} is empty`,
          suggestedFix: { field, action: 'populate' },
        });
      }

      if (typeof value === 'string' && value.trim() === '') {
        issues.push({
          entityType,
          entityId,
          issueType: 'blank_string',
          description: `Field ${field} is blank`,
          suggestedFix: { field, action: 'trim_or_fill' },
        });
      }
    }

    const saved = await Promise.all(issues.map((issue) => this.recordIssue(workspaceId, issue)));
    return saved;
  }

  async resolveIssue(id: string, workspaceId: string, resolvedBy?: string): Promise<DataQualityIssue> {
    const issue = await this.issueRepo.findOne({ where: { id, workspaceId } });
    if (!issue) throw new NotFoundException(`Data quality issue ${id} not found`);

    issue.isResolved = true;
    issue.resolvedAt = new Date();
    issue.resolvedBy = resolvedBy ?? null;
    return this.issueRepo.save(issue);
  }

  async getSummary(workspaceId: string): Promise<{
    agents: number;
    activeAgents: number;
    issues: number;
    resolvedIssues: number;
    unresolvedIssues: number;
  }> {
    const [agents, issues] = await Promise.all([
      this.agentRepo.find({ where: { workspaceId } }),
      this.issueRepo.find({ where: { workspaceId } }),
    ]);

    const resolvedIssues = issues.filter((issue) => issue.isResolved).length;
    return {
      agents: agents.length,
      activeAgents: agents.filter((agent) => agent.status === DataHygieneStatus.ACTIVE).length,
      issues: issues.length,
      resolvedIssues,
      unresolvedIssues: issues.length - resolvedIssues,
    };
  }
}
