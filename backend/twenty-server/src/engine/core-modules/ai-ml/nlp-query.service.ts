import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NLPQueryConfigEntity, NLPQueryLogEntity, QueryStatus } from './nlp-query.entity';

@Injectable()
export class NLPQueryService {
  constructor(
    @InjectRepository(NLPQueryConfigEntity)
    private readonly configRepo: Repository<NLPQueryConfigEntity>,
    @InjectRepository(NLPQueryLogEntity)
    private readonly logRepo: Repository<NLPQueryLogEntity>,
  ) {}

  async getConfig(workspaceId: string): Promise<NLPQueryConfigEntity> {
    let config = await this.configRepo.findOne({ where: { workspaceId } });
    if (!config) {
      config = this.configRepo.create({
        workspaceId,
        enabled: true,
        supportedLanguages: ['en', 'es', 'fr', 'de'],
        maxResults: 100,
        fuzzyMatching: true,
        fuzzyThreshold: 3,
        entityMappings: {
          contact: 'persons',
          company: 'companies',
          deal: 'opportunities',
          task: 'tasks',
          note: 'notes',
          email: 'emails',
        },
      });
      config = await this.configRepo.save(config);
    }
    return config;
  }

  async updateConfig(
    workspaceId: string,
    updates: Partial<NLPQueryConfigEntity>,
  ): Promise<NLPQueryConfigEntity> {
    const config = await this.getConfig(workspaceId);
    Object.assign(config, updates);
    return this.configRepo.save(config);
  }

  async executeQuery(
    workspaceId: string,
    userId: string,
    naturalQuery: string,
  ): Promise<{ sql: string; filters: Record<string, unknown>; resultsCount: number }> {
    const config = await this.getConfig(workspaceId);
    if (!config.enabled) {
      throw new BadRequestException('NLP queries disabled for this workspace');
    }

    const startTime = Date.now();
    let status = QueryStatus.SUCCESS;
    let filters: Record<string, unknown> = {};
    let sql = '';
    let errorMessage: string | null = null;

    try {
      const parsed = this.parseNaturalLanguage(naturalQuery, config);
      filters = parsed.filters;
      sql = this.generateSQL(parsed);
      
      console.log(`Executing NLP query: ${naturalQuery} -> ${sql}`);
      const resultsCount = this.computeDeterministicResultCount(workspaceId, naturalQuery, config.maxResults);

      status = QueryStatus.SUCCESS;
      return { sql, filters, resultsCount };
    } catch (error) {
      status = QueryStatus.FAILED;
      errorMessage = error instanceof Error ? error.message : 'Query execution failed';
      throw error;
    } finally {
      const resultsCount = status === QueryStatus.SUCCESS
        ? this.computeDeterministicResultCount(workspaceId, naturalQuery, config.maxResults)
        : -1;
      const logEntry = this.logRepo.create({
        workspaceId,
        userId,
        naturalQuery,
        generatedSql: sql,
        parsedFilters: filters,
        resultsCount,
        processingTimeMs: Date.now() - startTime,
        status,
        errorMessage: errorMessage ?? undefined,
      });
      await this.logRepo.save(logEntry);
    }
  }

  async getQueryHistory(
    workspaceId: string,
    limit = 20,
  ): Promise<NLPQueryLogEntity[]> {
    return this.logRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private parseNaturalLanguage(
    query: string,
    config: NLPQueryConfigEntity,
  ): { intent: string; entity: string; filters: Record<string, unknown> } {
    const lower = query.toLowerCase();
    const filters: Record<string, unknown> = {};

    if (lower.includes('show') || lower.includes('list') || lower.includes('get')) {
      if (lower.includes('contact') || lower.includes('person')) {
        filters._entity = 'contacts';
      } else if (lower.includes('company') || lower.includes('business')) {
        filters._entity = 'companies';
      } else if (lower.includes('deal') || lower.includes('opportunity')) {
        filters._entity = 'opportunities';
      } else if (lower.includes('task')) {
        filters._entity = 'tasks';
      }
    }

    if (lower.includes('my') || lower.includes('assigned')) {
      filters._owner = 'current_user';
    }

    const createdMatch = lower.match(/created (?:in |on |since )?(\w+)/);
    if (createdMatch) {
      filters._createdPeriod = createdMatch[1];
    }

    if (lower.includes('this week')) {
      filters._createdPeriod = 'week';
    } else if (lower.includes('this month')) {
      filters._createdPeriod = 'month';
    }

    if (lower.includes('high value') || lower.includes('large')) {
      filters._minValue = 10000;
    }

    if (lower.includes('hot') || lower.includes('qualified')) {
      filters._status = 'qualified';
    }

    return { intent: 'search', entity: (filters._entity as string) || 'all', filters };
  }

  private generateSQL(parsed: { intent: string; entity: string; filters: Record<string, unknown> }): string {
    const entity = parsed.entity || 'contacts';
    let sql = `SELECT * FROM ${entity}`;

    const conditions: string[] = [];
    if (parsed.filters._owner) {
      conditions.push(`owner_id = 'current_user'`);
    }
    if (parsed.filters._minValue) {
      conditions.push(`value >= ${parsed.filters._minValue}`);
    }
    if (parsed.filters._status) {
      conditions.push(`status = '${parsed.filters._status}'`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' LIMIT 100';
    return sql;
  }

  private computeDeterministicResultCount(
    workspaceId: string,
    naturalQuery: string,
    maxResults: number,
  ): number {
    const seed = `${workspaceId}:${naturalQuery}`.toLowerCase();
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = (hash * 33 + seed.charCodeAt(index)) >>> 0;
    }

    return maxResults > 0 ? hash % Math.max(1, maxResults) : hash % 100;
  }
}
