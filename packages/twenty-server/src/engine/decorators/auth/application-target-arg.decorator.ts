import { Args, type ArgsOptions } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import {
  type ApplicationTargetKind,
  type StringPathOf,
} from 'src/engine/core-modules/application/types/application-target.type';
import { attachApplicationTarget } from 'src/engine/core-modules/application/utils/attach-application-target.util';

// Replaces @Args so the argument the guard reads is the one the schema
// declares. TInput defaults to never, so an idKey requires the input type.
export const ApplicationTargetArg =
  <TInput = never>(
    argName: string,
    target: ApplicationTargetKind & { idKey?: StringPathOf<TInput> },
    argsOptions?: ArgsOptions,
  ): ParameterDecorator =>
  (prototype, propertyKey, parameterIndex) => {
    attachApplicationTarget({
      prototype,
      propertyKey,
      target: { ...target, source: 'graphqlArg', argName },
    });

    const argsDecorator = isDefined(argsOptions)
      ? Args(argName, argsOptions)
      : Args(argName);

    argsDecorator(prototype, propertyKey, parameterIndex);
  };
