import { subDays, subHours } from 'date-fns';

export const computeStartEndDate = (
  windowLength: '7D' | '1D' | '12H' | '4H',
) => {
  //yes we agree this is weird i'm going to change the implementation in tinybird in order to work
  // without those weird Date string replacements
  const now = new Date(Date.now());
  const end = now.toISOString().replace('T', ' ').replace('Z', '');
  switch (windowLength) {
    case '7D':
      return {
        start: subDays(now, 7).toISOString().replace('T', ' ').replace('Z', ''),
        end,
      };
    case '1D':
      return {
        start: subDays(now, 1).toISOString().replace('T', ' ').replace('Z', ''),
        end,
      };
    case '12H':
      return {
        start: subHours(now, 12)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', ''),
        end,
      };
    case '4H':
      return {
        start: subHours(now, 4)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', ''),
        end,
      };
  }
};
