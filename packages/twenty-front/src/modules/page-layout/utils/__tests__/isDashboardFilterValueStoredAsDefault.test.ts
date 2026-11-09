import { isDashboardFilterValueStoredAsDefault } from '@/page-layout/utils/isDashboardFilterValueStoredAsDefault';
import { ViewFilterOperand } from 'twenty-shared/types';

const relative = (value: string) => ({
  conditions: [{ operand: ViewFilterOperand.IS_RELATIVE, value }],
});

const range = (start: string, dayAfterEnd: string) => ({
  conditions: [
    { operand: ViewFilterOperand.IS_AFTER, value: start },
    { operand: ViewFilterOperand.IS_BEFORE, value: dayAfterEnd },
  ],
});

describe('isDashboardFilterValueStoredAsDefault', () => {
  it('should read an explicit empty value as no default', () => {
    expect(
      isDashboardFilterValueStoredAsDefault({ conditions: [] }, null),
    ).toBe(true);
  });

  it('should match a bare relative value with the same default stored with a time zone', () => {
    expect(
      isDashboardFilterValueStoredAsDefault(
        relative('THIS_1_MONTH'),
        relative('THIS_1_MONTH;;Europe/Paris;;MONDAY;;'),
      ),
    ).toBe(true);
  });

  it('should match the same custom range', () => {
    expect(
      isDashboardFilterValueStoredAsDefault(
        range('2026-03-10', '2026-03-21'),
        range('2026-03-10', '2026-03-21'),
      ),
    ).toBe(true);
  });

  it('should not match a different range', () => {
    expect(
      isDashboardFilterValueStoredAsDefault(
        range('2026-03-10', '2026-03-21'),
        range('2026-03-10', '2026-03-22'),
      ),
    ).toBe(false);
  });
});
