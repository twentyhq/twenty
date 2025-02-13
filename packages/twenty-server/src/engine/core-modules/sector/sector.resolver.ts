import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateSectorInput } from 'src/engine/core-modules/sector/dtos/create-sector.input';
import { UpdateSectorInput } from 'src/engine/core-modules/sector/dtos/update-sector.input';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { SectorService } from 'src/engine/core-modules/sector/sector.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => Sector)
export class SectorResolver {
  constructor(private readonly sectorService: SectorService) {}

  @Mutation(() => Sector)
  async createSector(
    @Args('createInput') createInput: CreateSectorInput,
  ): Promise<Sector> {
    return await this.sectorService.create(createInput);
  }

  @Query(() => [Sector])
  async sectorsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<Sector[]> {
    return await this.sectorService.findAll(workspaceId);
  }

  @Query(() => Sector)
  async sectorById(@Args('sectorId') sectorId: string): Promise<Sector | null> {
    return await this.sectorService.findById(sectorId);
  }

  @Mutation(() => Sector)
  async updateSector(
    @Args('updateInput') updateInput: UpdateSectorInput,
  ): Promise<Sector> {
    return await this.sectorService.update(updateInput);
  }

  @Mutation(() => Boolean)
  async deleteSector(@Args('sectorId') sectorId: string): Promise<boolean> {
    return await this.sectorService.delete(sectorId);
  }
}
