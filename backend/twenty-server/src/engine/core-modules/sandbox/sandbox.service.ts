import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
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
      refreshToken: data.refreshToken ?? randomUUID(),
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
    return this.findOne(id, workspaceId);
  }

  async deleteSandbox(id: string, workspaceId: string): Promise<void> {
    const sandbox = await this.findOne(id, workspaceId);

    if (sandbox.databaseSchema) {
      await this.dropSandboxSchema(sandbox.databaseSchema);
    }
    await this.sandboxRepo.delete({ id, workspaceId });
  }

  async setAutoRefresh(
    id: string,
    workspaceId: string,
    autoRefresh: boolean,
    autoRefreshIntervalHours?: number,
  ): Promise<SandboxEntity> {
    await this.sandboxRepo.update(
      { id, workspaceId },
      {
        autoRefresh,
        ...(autoRefreshIntervalHours ? { autoRefreshIntervalHours } : {}),
      },
    );

    return this.findOne(id, workspaceId);
  }

  async getSummary(workspaceId: string): Promise<{
    total: number;
    active: number;
    creating: number;
    paused: number;
    failed: number;
    autoRefreshEnabled: number;
    expiringSoon: number;
  }> {
    const sandboxes = await this.sandboxRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const expiringSoon = sandboxes.filter((sandbox) => {
      if (!sandbox.expiresAt) return false;
      const delta = sandbox.expiresAt.getTime() - now;
      return delta >= 0 && delta <= sevenDaysMs;
    }).length;

    return {
      total: sandboxes.length,
      active: sandboxes.filter((sandbox) => sandbox.status === SandboxStatus.ACTIVE).length,
      creating: sandboxes.filter((sandbox) => sandbox.status === SandboxStatus.CREATING).length,
      paused: sandboxes.filter((sandbox) => sandbox.status === SandboxStatus.PAUSED).length,
      failed: sandboxes.filter((sandbox) => sandbox.status === SandboxStatus.FAILED).length,
      autoRefreshEnabled: sandboxes.filter((sandbox) => sandbox.autoRefresh).length,
      expiringSoon,
    };
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
