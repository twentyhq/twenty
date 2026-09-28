import { Args } from '@nestjs/graphql';

import {
  type ApplicationTargetKind,
  type StringPathOf,
} from 'src/engine/core-modules/application/types/application-target.type';
import { attachApplicationTarget } from 'src/engine/core-modules/application/utils/attach-application-target.util';

// @ArgsType counterpart of ApplicationTargetArg: replaces a bare @Args()
export const ApplicationTargetArgs =
  <TArgs = never>(
    target: ApplicationTargetKind & { idKey: StringPathOf<TArgs> },
  ): ParameterDecorator =>
  (prototype, propertyKey, parameterIndex) => {
    attachApplicationTarget({
      prototype,
      propertyKey,
      target: { ...target, source: 'graphqlArgs' },
    });

    Args()(prototype, propertyKey, parameterIndex);
  };
