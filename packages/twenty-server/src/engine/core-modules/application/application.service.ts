import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { PackageJson } from 'src/engine/core-modules/application/types/application.types';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async findById(id: string): Promise<ApplicationEntity | null> {
    return this.applicationRepository.findOne({
      where: { id },
    });
  }

  async findByUniversalIdentifier(
    universalIdentifier: string,
    workspaceId: string,
  ) {
    return this.applicationRepository.findOne({
      where: {
        universalIdentifier,
        workspaceId,
      },
    });
  }

  async create(data: {
    universalIdentifier?: string;
    name: string;
    description?: string;
    version?: string;
    serverlessFunctionLayerId: string;
    sourcePath: string;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const application = this.applicationRepository.create({
      ...data,
      sourceType: 'local',
    });

    return this.applicationRepository.save(application);
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      version?: string;
      sourcePath?: string;
      packageJson?: PackageJson;
      yarnLock?: string;
      packageChecksum?: string;
    },
  ): Promise<ApplicationEntity> {
    await this.applicationRepository.update({ id }, data);

    const updatedApplication = await this.findById(id);

    if (!updatedApplication) {
      throw new Error(`Failed to update application with id ${id}`);
    }

    return updatedApplication;
  }
}
