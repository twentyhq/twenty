import * as Sentry from '@sentry/node';

const DEFAULT_MAX_RUNTIME_IN_MINUTES = 5;

export function SentryCronMonitor(
  monitorSlug: string,
  schedule: string,
  {
    maxRuntimeInMinutes = DEFAULT_MAX_RUNTIME_IN_MINUTES,
  }: { maxRuntimeInMinutes?: number } = {},
) {
  return function (
    // oxlint-disable-next-line typescript/no-explicit-any
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // oxlint-disable-next-line typescript/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      if (!Sentry.isInitialized()) {
        return await originalMethod.apply(this, args);
      }

      let checkInId: string | undefined;

      try {
        checkInId = Sentry.captureCheckIn(
          {
            monitorSlug,
            status: 'in_progress',
          },
          {
            schedule: {
              type: 'crontab',
              value: schedule,
            },
            checkinMargin: 1,
            maxRuntime: maxRuntimeInMinutes,
            timezone: 'UTC',
          },
        );
        const result = await originalMethod.apply(this, args);

        Sentry.captureCheckIn({
          checkInId,
          monitorSlug,
          status: 'ok',
        });

        return result;
      } catch (error) {
        Sentry.captureCheckIn({
          checkInId,
          monitorSlug,
          status: 'error',
        });
        throw error;
      }
    };

    return descriptor;
  };
}
