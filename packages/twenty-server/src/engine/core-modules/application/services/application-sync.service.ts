import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { LocalApplicationSourceProvider } from 'src/engine/core-modules/application/providers/local-application-source.provider';
import { ApplicationSyncAgentService } from 'src/engine/core-modules/application/services/application-sync-agent.service';
import { FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export interface ApplicationSyncContext {
  workspaceId: string;
  featureFlags: Record<string, boolean>;
  applicationId: string;
}

interface ApplicationManifest {
  standardId: string;
  label: string;
  description?: string;
  version?: string;
  agents?: FlatAgent[];
}

@Injectable()
export class ApplicationSyncService {
  private readonly logger = new Logger(ApplicationSyncService.name);

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly localSourceProvider: LocalApplicationSourceProvider,
    private readonly applicationSyncAgentService: ApplicationSyncAgentService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async synchronize(context: ApplicationSyncContext): Promise<void> {
    this.logger.log(`Syncing agents for application: ${context.applicationId}`);

    const application = await this.applicationRepository.findOne({
      where: { id: context.applicationId },
    });

    if (!application) {
      throw new Error(`Application with ID ${context.applicationId} not found`);
    }

    const manifest = await this.localSourceProvider.fetchManifest(
      application.sourcePath,
    );

    this.logger.log(`Syncing application: ${manifest.label}`);

    await this.applicationSyncAgentService.synchronize(
      context,
      manifest.agents,
    );

    this.logger.log('✅ Agent sync completed');
  }

  public async synchronizeFromManifest(
    workspaceId: string,
    manifest: ApplicationManifest,
  ): Promise<ApplicationEntity> {
    this.logger.log(`Syncing application from manifest: ${manifest.label}`);

    // Find or create application
    let application = await this.applicationService.findByStandardId(
      manifest.standardId,
      workspaceId,
    );

    if (application.length === 0) {
      // Create new application
      application = [
        await this.applicationService.create({
          standardId: manifest.standardId,
          label: manifest.label,
          description: manifest.description,
          version: manifest.version,
          sourcePath: 'cli-sync', // Placeholder for CLI-synced apps
          workspaceId,
        }),
      ];
      this.logger.log(`Created new application: ${manifest.label}`);
    } else {
      // Update existing application
      const existingApp = application[0];

      await this.applicationService.update(existingApp.id, {
        label: manifest.label,
        description: manifest.description,
        version: manifest.version,
      });
      this.logger.log(`Updated existing application: ${manifest.label}`);
    }

    const app = application[0];

    // Sync agents
    if (manifest.agents && manifest.agents.length > 0) {
      const context: ApplicationSyncContext = {
        workspaceId,
        featureFlags: {}, // TODO: Get actual feature flags
        applicationId: app.id,
      };

      await this.applicationSyncAgentService.synchronize(
        context,
        manifest.agents,
      );
    }

    this.logger.log('✅ Application sync from manifest completed');

    return app;
  }
}
