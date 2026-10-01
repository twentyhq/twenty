import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isObject, isString } from '@sniptt/guards';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';

const readPath = (value: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (currentValue, key) =>
        isObject(currentValue)
          ? (currentValue as Record<string, unknown>)[key]
          : undefined,
      value,
    );

const readApplicationTargetValue = ({
  context,
  request,
  target,
}: {
  context: ExecutionContext;
  request: { params?: Record<string, unknown> };
  target: ApplicationTarget;
}): unknown => {
  switch (target.source) {
    case 'graphqlArg': {
      const argValue =
        GqlExecutionContext.create(context).getArgs()[target.argName];

      return isDefined(target.idKey)
        ? readPath(argValue, target.idKey)
        : argValue;
    }
    case 'graphqlArgs':
      return readPath(
        GqlExecutionContext.create(context).getArgs(),
        target.idKey,
      );
    case 'routeParam':
      return request.params?.[target.argName];
    default:
      return assertUnreachable(target);
  }
};

const getApplicationTargetName = (target: ApplicationTarget): string => {
  switch (target.source) {
    case 'graphqlArg':
      return isDefined(target.idKey)
        ? `${target.argName}.${target.idKey}`
        : target.argName;
    case 'graphqlArgs':
      return target.idKey;
    case 'routeParam':
      return target.argName;
    default:
      return assertUnreachable(target);
  }
};

// Guards run before the validation pipe and look the id up in uuid columns
export const readApplicationTargetIdOrThrow = ({
  context,
  request,
  target,
}: {
  context: ExecutionContext;
  request: { params?: Record<string, unknown> };
  target: ApplicationTarget;
}): string => {
  const targetValue = readApplicationTargetValue({ context, request, target });

  if (!isString(targetValue) || !uuidValidate(targetValue)) {
    throw new ApplicationException(
      `Application target "${getApplicationTargetName(target)}" must be a UUID`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return targetValue;
};
