import * as Sentry from '@sentry/node';

const DEFAULT_MAX_RUNTIME_IN_MINUTES = 5;

// A schedule function receives the job's arguments, for schedules chosen at
// registration time.
export function SentryCronMonitor(
  monitorSlug: string,
  // oxlint-disable-next-line typescript/no-explicit-any
  schedule: string | ((...args: any[]) => string),
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
              value:
                typeof schedule === 'function' ? schedule(...args) : schedule,
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
