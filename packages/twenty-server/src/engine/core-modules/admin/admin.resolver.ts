import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { ImpersonateInput } from 'src/engine/core-modules/admin/dtos/impersonate.input';
import { Verify } from 'src/engine/core-modules/auth/dto/verify.entity';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AdminService } from './admin.service';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  @Mutation(() => Verify)
  async impersonate(
    @Args() impersonateInput: ImpersonateInput,
    @AuthUser() user: User,
  ): Promise<Verify> {
    return await this.adminService.impersonate(impersonateInput.userId, user);
  }
}
