import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateSectorInput } from 'src/engine/core-modules/sector/dtos/create-sector.input';
import { UpdateSectorInput } from 'src/engine/core-modules/sector/dtos/update-sector.input';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export class SectorService {
  constructor(
    @InjectRepository(Sector, 'core')
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(createInput: CreateSectorInput): Promise<Sector> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: createInput.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const createdSector = this.sectorRepository.create({
      ...createInput,
      workspace,
    });

    const savedSector = await this.sectorRepository.save(createdSector);

    return savedSector;
  }

  async findAll(workspaceId: string): Promise<Sector[]> {
    return await this.sectorRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });
  }

  async findById(sectorId: string): Promise<Sector | null> {
    return await this.sectorRepository.findOne({
      where: { id: sectorId },
      relations: ['workspace', 'agents'],
    });
  }

  async update(updateInput: UpdateSectorInput): Promise<Sector> {
    const sector = await this.sectorRepository.findOne({
      where: { id: updateInput.id },
      relations: ['workspace'],
    });

    if (!sector) {
      throw new Error(`Sector not found`);
    }

    const updatedSector = {
      ...sector,
      ...updateInput,
    };

    return this.sectorRepository.save(updatedSector);
  }

  async delete(sectorId: string): Promise<boolean> {
    const sector = await this.sectorRepository.findOne({
      where: { id: sectorId },
    });

    if (sector) {
      const { affected } = await this.sectorRepository.delete(sectorId);

      if (!affected) {
        throw new BadRequestException(undefined, {
          description: `Error when removing sector ${sector.name}`,
        });
      }

      return affected ? true : false;
    }

    throw new BadRequestException(undefined, {
      description: `Sector not found with id ${sectorId}`,
    });
  }
}
