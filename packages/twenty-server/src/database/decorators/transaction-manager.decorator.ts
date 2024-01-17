import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { EntityManager } from 'typeorm';

export const TransactionManager = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): EntityManager => {
    const args = ctx.getArgs();
    const entityManager = args.find(
      (arg) => arg.constructor.name === 'EntityManager',
    );

    return entityManager;
  },
);
