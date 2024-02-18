import { Resolver } from '@nestjs/graphql';

import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';

@Resolver(() => UserWorkspace)
export class UserResolver {}
