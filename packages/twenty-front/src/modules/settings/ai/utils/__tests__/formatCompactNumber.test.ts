import { formatCompactNumber } from '@/settings/ai/utils/formatCompactNumber';

it('preserves the default precision when decimals are omitted', () => {
  expect(formatCompactNumber(65_536)).toBe('66K');
  expect(formatCompactNumber(65_536, 1)).toBe('65.5K');
});
