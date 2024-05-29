import { Query, Resolver } from '@nestjs/graphql';

import { SharedService } from './shared.service';

@Resolver()
export class TestResolver {
  constructor(private readonly sharedService: SharedService) {}

  @Query(() => Number)
  async getWorkspaceEntityCount(): Promise<number> {
    return this.sharedService.getWorkspaceMemberEntityCount();
  }
}
