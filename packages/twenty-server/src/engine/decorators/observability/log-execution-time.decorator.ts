import { Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';

/**
 * A decorator function that logs the execution time of the decorated method.
 *
 * @returns The modified property descriptor with the execution time logging functionality.
 */
export function LogExecutionTime(label?: string | undefined) {
  return function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}:${propertyKey}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();

      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      const executionTime = end - start;

      if (isDefined(label)) {
        logger.log(`${label} execution time: ${executionTime.toFixed(2)}ms`);
      } else {
        logger.log(`Execution time: ${executionTime.toFixed(2)}ms`);
      }

      return result;
    };

    return descriptor;
  };
}
