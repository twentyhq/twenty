// traceable-link-logs/traceable-link-logs.resolver.ts

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTraceableLinkLogInput } from 'src/engine/core-modules/traceable-links-logs/dtos/create-traceable-links-logs.input';
import { UpdateTraceableLinkLogInput } from 'src/engine/core-modules/traceable-links-logs/dtos/update-traceable-links-logs.input';
import { TraceableLinkLog } from 'src/engine/core-modules/traceable-links-logs/traceable-links-logs.entity';
import { TraceableLinkLogsService } from 'src/engine/core-modules/traceable-links-logs/traceable-links-logs.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => TraceableLinkLog)
export class TraceableLinkLogsResolver {
  constructor(
    @InjectRepository(TraceableLinkLog, 'core')
    private readonly traceableLinkLogsService: TraceableLinkLogsService,
  ) {}

  @Mutation(() => TraceableLinkLog)
  async createTraceableLinkLog(
    @Args('createInput') createInput: CreateTraceableLinkLogInput,
  ): Promise<TraceableLinkLog> {
    return await this.traceableLinkLogsService.create(createInput);
  }

  @Query(() => [TraceableLinkLog])
  async traceableLinkLogs(): Promise<TraceableLinkLog[]> {
    return await this.traceableLinkLogsService.findAll();
  }

  @Query(() => TraceableLinkLog)
  async traceableLinkLogById(
    @Args('id') id: string,
  ): Promise<TraceableLinkLog | null> {
    return await this.traceableLinkLogsService.findById(id);
  }

  @Mutation(() => TraceableLinkLog)
  async updateTraceableLinkLog(
    @Args('updateInput') updateInput: UpdateTraceableLinkLogInput,
  ): Promise<TraceableLinkLog> {
    return await this.traceableLinkLogsService.update(updateInput);
  }

  @Mutation(() => Boolean)
  async deleteTraceableLinkLog(@Args('id') id: string): Promise<boolean> {
    return await this.traceableLinkLogsService.delete(id);
  }
}
