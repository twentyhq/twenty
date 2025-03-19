// traceable-link-logs/traceable-link-logs.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateTraceableLinkLogInput } from 'src/engine/core-modules/traceable-links-logs/dtos/create-traceable-links-logs.input';
import { UpdateTraceableLinkLogInput } from 'src/engine/core-modules/traceable-links-logs/dtos/update-traceable-links-logs.input';
import { TraceableLinkLog } from 'src/engine/core-modules/traceable-links-logs/traceable-links-logs.entity';

@Injectable()
export class TraceableLinkLogsService {
  constructor(
    @InjectRepository(TraceableLinkLog, 'core')
    private readonly traceableLinkLogRepository: Repository<TraceableLinkLog>,
  ) {}

  async create(
    createInput: CreateTraceableLinkLogInput,
  ): Promise<TraceableLinkLog> {
    console.log('INICIANDO TRACEABLE LINKS LOGS');
    const log = this.traceableLinkLogRepository.create(createInput);

    return await this.traceableLinkLogRepository.save(log);
  }

  async findAll(): Promise<TraceableLinkLog[]> {
    return await this.traceableLinkLogRepository.find();
  }

  async findById(id: string): Promise<TraceableLinkLog | null> {
    return await this.traceableLinkLogRepository.findOne({ where: { id } });
  }

  async update(
    updateInput: UpdateTraceableLinkLogInput,
  ): Promise<TraceableLinkLog> {
    const log = await this.traceableLinkLogRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!log) {
      throw new Error('Log not found');
    }

    const updatedLog = { ...log, ...updateInput };

    return await this.traceableLinkLogRepository.save(updatedLog);
  }

  async delete(id: string): Promise<boolean> {
    const { affected } = await this.traceableLinkLogRepository.delete(id);

    return affected ? true : false;
  }
}
