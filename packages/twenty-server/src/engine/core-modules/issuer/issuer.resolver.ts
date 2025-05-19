import {
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { IssuerService } from './issuer.service';

import { CreateIssuerInput } from './dtos/create-issuer.input';
import { IssuerDto } from './dtos/issuer.dto';
import { UpdateIssuerInput } from './dtos/update-issuer.input';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => IssuerDto)
export class IssuerResolver {
  constructor(private readonly issuerService: IssuerService) {}

  @Mutation(() => IssuerDto)
  async createIssuer(
    @Args('createInput') createInput: CreateIssuerInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<IssuerDto> {
    if (createInput.workspaceId !== workspace.id) {
      throw new BadRequestException(
        'Input workspaceId does not match authenticated workspace.',
      );
    }

    return this.issuerService.create(createInput);
  }

  @Query(() => [IssuerDto])
  async getIssuersByWorkspace(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<IssuerDto[]> {
    return this.issuerService.findAllByWorkspace(workspace.id);
  }

  @Query(() => IssuerDto)
  async getIssuerById(
    @Args('id', { type: () => ID }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<IssuerDto> {
    const issuer = await this.issuerService.findById(id);

    if (issuer.workspace.id !== workspace.id) {
      throw new ForbiddenException(
        'You do not have permission to access this issuer.',
      );
    }

    return issuer;
  }

  @Mutation(() => IssuerDto)
  async updateIssuer(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateInput') updateInput: UpdateIssuerInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<IssuerDto> {
    const issuer = await this.issuerService.findById(id);

    if (issuer.workspace.id !== workspace.id) {
      throw new ForbiddenException(
        'You do not have permission to update this issuer.',
      );
    }

    return this.issuerService.update(id, updateInput);
  }

  @Mutation(() => Boolean)
  async deleteIssuer(
    @Args('id', { type: () => ID }) id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const issuer = await this.issuerService.findById(id);

    if (issuer.workspace.id !== workspace.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this issuer.',
      );
    }

    return this.issuerService.delete(id);
  }
}
