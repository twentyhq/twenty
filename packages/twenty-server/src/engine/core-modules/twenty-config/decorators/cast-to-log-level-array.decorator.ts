import { Transform } from 'class-transformer';

import { TypedReflect } from 'src/utils/typed-reflect';

export const CastToLogLevelArray =
  () =>
  <T extends object>(target: T, propertyKey: keyof T & string) => {
    Transform(({ value }: { value: string }) => toLogLevelArray(value))(
      target,
      propertyKey,
    );

    TypedReflect.defineMetadata(
      'config-variable:type',
      'array',
      target.constructor,
      propertyKey,
    );
  };

const toLogLevelArray = (value: any) => {
  if (typeof value === 'string') {
    const rawLogLevels = value.split(',').map((level) => level.trim());
    const isInvalid = rawLogLevels.some(
      (level) => !['log', 'error', 'warn', 'debug', 'verbose'].includes(level),
    );

    if (!isInvalid) {
      return rawLogLevels;
    }
  }

  return undefined;
};
