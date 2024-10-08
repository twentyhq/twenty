import * as Sentry from '@sentry/node';

export function SentryCronMonitor(monitorSlug: string, schedule: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

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
            maxRuntime: 5,
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
