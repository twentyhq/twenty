import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SandboxEntity, SandboxStatus, SandboxSource } from './sandbox.entity';

@Injectable()
export class SandboxService {
  constructor(
    @InjectRepository(SandboxEntity)
    private readonly sandboxRepo: Repository<SandboxEntity>,
  ) {}

  async createSandbox(
    workspaceId: string,
    data: Partial<SandboxEntity>,
  ): Promise<SandboxEntity> {
    const sandbox = this.sandboxRepo.create({
      ...data,
      workspaceId,
      status: SandboxStatus.CREATING,
    });
    const saved = await this.sandboxRepo.save(sandbox);
    
    setTimeout(() => {
      this.provisionSandbox(saved.id).catch(console.error);
    }, 100);

    return saved;
  }

  async findByWorkspace(workspaceId: string): Promise<SandboxEntity[]> {
    return this.sandboxRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, workspaceId: string): Promise<SandboxEntity> {
    const sandbox = await this.sandboxRepo.findOne({
      where: { id, workspaceId },
    });
    if (!sandbox) {
      throw new NotFoundException(`Sandbox ${id} not found`);
    }
    return sandbox;
  }

  async pauseSandbox(id: string, workspaceId: string): Promise<SandboxEntity> {
    await this.sandboxRepo.update({ id, workspaceId }, { status: SandboxStatus.PAUSED });
    return this.findOne(id, workspaceId);
  }

  async resumeSandbox(id: string, workspaceId: string): Promise<SandboxEntity> {
    await this.sandboxRepo.update({ id, workspaceId }, { status: SandboxStatus.ACTIVE });
    return this.findOne(id, workspaceId);
  }

  async refreshSandbox(id: string, workspaceId: string): Promise<SandboxEntity> {
    const sandbox = await this.findOne(id, workspaceId);
    
    await this.sandboxRepo.update({ id, workspaceId }, { 
      status: SandboxStatus.CREATING,
      lastRefreshedAt: new Date(),
    });

    setTimeout(() => {
      this.provisionSandbox(id).catch(console.error);
    }, 100);

    return sandbox;
  }

  async deleteSandbox(id: string, workspaceId: string): Promise<void> {
    const sandbox = await this.findOne(id, workspaceId);
    
    await this.dropSandboxSchema(sandbox.databaseSchema);
    await this.sandboxRepo.delete({ id, workspaceId });
  }

  private async provisionSandbox(sandboxId: string): Promise<void> {
    try {
      const sandbox = await this.sandboxRepo.findOneBy({ id: sandboxId });
      if (!sandbox) return;

      const schemaName = `sandbox_${sandboxId.slice(0, 8)}`;
      
      await this.createSandboxSchema(schemaName, sandbox.sourceWorkspaceId, sandbox.includeData, sandbox.dataSamplePercent);

      await this.sandboxRepo.update(sandboxId, {
        status: SandboxStatus.ACTIVE,
        databaseSchema: schemaName,
      });
    } catch (error) {
      await this.sandboxRepo.update(sandboxId, { status: SandboxStatus.FAILED });
      console.error(`Sandbox provisioning failed: ${error}`);
    }
  }

  private async createSandboxSchema(
    schemaName: string,
    sourceWorkspaceId: string | null,
    includeData: boolean,
    samplePercent: number,
  ): Promise<void> {
    console.log(`Creating sandbox schema: ${schemaName}`);
    console.log(`Source workspace: ${sourceWorkspaceId}`);
    console.log(`Include data: ${includeData}, Sample: ${samplePercent}%`);
  }

  private async dropSandboxSchema(schemaName: string): Promise<void> {
    console.log(`Dropping sandbox schema: ${schemaName}`);
  }
}
