import { subDays, subHours } from 'date-fns';

export const computeStartEndDate = (
  windowLength: '7D' | '1D' | '12H' | '4H',
) => {
  const now = new Date(Date.now());
  const end = now.toISOString();
  switch (windowLength) {
    case '7D':
      return {
        start: subDays(now, 7).toISOString(),
        end,
      };
    case '1D':
      return {
        start: subDays(now, 1).toISOString(),
        end,
      };
    case '12H':
      return {
        start: subHours(now, 12).toISOString(),
        end,
      };
    case '4H':
      return {
        start: subHours(now, 4).toISOString(),
        end,
      };
  }
};
