import { Logger } from '@nestjs/common';

/**
 * A decorator function that logs the execution time of the decorated method.
 *
 * @returns The modified property descriptor with the execution time logging functionality.
 */
export function LogExecutionTime() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`${target.constructor.name}:${propertyKey}`);

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();

      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      const executionTime = end - start;

      logger.log(`Execution time: ${executionTime.toFixed(2)}ms`);

      return result;
    };

    return descriptor;
  };
}
