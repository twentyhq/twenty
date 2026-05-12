import {
  type BeforeCreateOneHook,
  type CreateOneInputType,
} from '@ptc-org/nestjs-query-graphql';

import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';

export class BeforeCreateOneAppToken<T extends AppTokenEntity>
  implements BeforeCreateOneHook<T>
{
  async run(
    instance: CreateOneInputType<T>,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    context: any,
  ): Promise<CreateOneInputType<T>> {
    const userId = context?.req?.user?.id;

    instance.input.userId = userId;

    return instance;
  }
}
