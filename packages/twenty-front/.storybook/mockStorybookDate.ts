import { install } from '@sinonjs/fake-timers';
import { isDefined } from 'twenty-shared/utils';

export const mockStorybookDate = (mockingDate?: Date | number | null) => {
  if (!isDefined(mockingDate)) {
    return;
  }

  const clock = install({
    now: mockingDate,
    toFake: ['Date'],
    shouldAdvanceTime: true,
  });

  return () => {
    clock.uninstall();
  };
};
