import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { formatNumber as utilFormatNumber } from '~/utils/format/formatNumber';

jest.mock('~/utils/format/formatNumber');

const mockUtilFormatNumber = utilFormatNumber as jest.MockedFunction<
  typeof utilFormatNumber
>;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot
    initializeState={({ set }) => {
      set(workspaceMemberFormatPreferencesState, {
        timeZone: 'UTC',
        dateFormat: 'MM/dd/yyyy' as any,
        timeFormat: 'HH:mm' as any,
        numberFormat: '1,000.00' as any,
        calendarStartDay: 'MONDAY' as any,
      });
    }}
  >
    {children}
  </RecoilRoot>
);

describe('useNumberFormat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof useNumberFormat).toBe('function');
  });

  it('should return formatNumber function and numberFormat', () => {
    const { result } = renderHook(() => useNumberFormat(), {
      wrapper: Wrapper,
    });

    expect(result.current).toHaveProperty('formatNumber');
    expect(result.current).toHaveProperty('numberFormat');
    expect(typeof result.current.formatNumber).toBe('function');
    expect(result.current.numberFormat).toBe('1,000.00');
  });

  it('should call utility formatNumber with correct parameters', () => {
    mockUtilFormatNumber.mockReturnValue('1,234.56');

    const { result } = renderHook(() => useNumberFormat(), {
      wrapper: Wrapper,
    });

    const value = 1234.56;
    const options = { decimals: 2 };

    const formattedValue = result.current.formatNumber(value, options);

    expect(mockUtilFormatNumber).toHaveBeenCalledWith(value, {
      format: '1,000.00',
      ...options,
    });
    expect(formattedValue).toBe('1,234.56');
  });

  it('should call utility formatNumber without options', () => {
    mockUtilFormatNumber.mockReturnValue('1,000');

    const { result } = renderHook(() => useNumberFormat(), {
      wrapper: Wrapper,
    });

    const value = 1000;

    const formattedValue = result.current.formatNumber(value);

    expect(mockUtilFormatNumber).toHaveBeenCalledWith(value, {
      format: '1,000.00',
    });
    expect(formattedValue).toBe('1,000');
  });

  it('should memoize formatNumber function based on numberFormat changes', () => {
    const { result, rerender } = renderHook(() => useNumberFormat(), {
      wrapper: Wrapper,
    });

    const firstFormatFunction = result.current.formatNumber;

    rerender();

    expect(result.current.formatNumber).toBe(firstFormatFunction);
  });
});
