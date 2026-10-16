import { isDefined } from 'twenty-shared/utils';

import { OPERATION_METADATA_KEY } from 'src/engine/core-modules/authorization/constants/operation-metadata-key.constant';

const LIFECYCLE_METHOD_NAMES = new Set(['constructor', 'onModuleInit']);

// Walks the instance's own classes, stopping at the guarded base class
export const assertEveryMethodDeclaresAnOperation = ({
  instance,
  baseClassPrototype,
}: {
  instance: object;
  baseClassPrototype: object;
}): void => {
  const undeclaredMethodNames: string[] = [];

  for (
    let prototype: object | null = Object.getPrototypeOf(instance);
    isDefined(prototype) && prototype !== baseClassPrototype;
    prototype = Object.getPrototypeOf(prototype)
  ) {
    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);

      if (
        LIFECYCLE_METHOD_NAMES.has(methodName) ||
        typeof descriptor?.value !== 'function'
      ) {
        continue;
      }

      if (
        !isDefined(
          Reflect.getMetadata(OPERATION_METADATA_KEY, descriptor.value),
        )
      ) {
        undeclaredMethodNames.push(methodName);
      }
    }
  }

  if (undeclaredMethodNames.length > 0) {
    throw new Error(
      `${instance.constructor.name} declares no @Operation on: ${undeclaredMethodNames.join(', ')}`,
    );
  }
};
