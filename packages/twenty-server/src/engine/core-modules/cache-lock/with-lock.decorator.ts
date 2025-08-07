import { Inject } from '@nestjs/common';

import {
  CacheLockOptions,
  CacheLockService,
} from 'src/engine/core-modules/cache-lock/cache-lock.service';

export const WithLock = (
  lockKeyParamPath: string,
  options?: CacheLockOptions,
): MethodDecorator => {
  const injectCacheLockService = Inject(CacheLockService);

  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    injectCacheLockService(target, 'cacheLockService');

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const self = this as { cacheLockService: CacheLockService };

      if (!self.cacheLockService) {
        throw new Error('cacheLockService not available on instance');
      }

      if (typeof args[0] !== 'object' || args[0] === null) {
        throw new Error(
          `You must use one object parameter to use @WithLock decorator. Received ${args}`,
        );
      }

      const key = (args[0] as Record<string, unknown>)[lockKeyParamPath];

      if (typeof key !== 'string') {
        throw new Error(
          `Could not resolve lock key from path "${lockKeyParamPath}" on first argument`,
        );
      }

      return await self.cacheLockService.withLock(
        () => originalMethod.apply(self, args),
        key,
        options,
      );
    };
  };
};
