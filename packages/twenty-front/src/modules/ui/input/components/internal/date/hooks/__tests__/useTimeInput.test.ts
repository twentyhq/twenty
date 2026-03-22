import { renderHook } from '@testing-library/react';

import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useTimeInput } from '@/ui/input/components/internal/date/hooks/useTimeInput';

describe('useTimeInput', () => {
  describe('24-hour format', () => {
    const render24 = () =>
      renderHook(() => useTimeInput(TimeFormat.HOUR_24)).result.current;

    describe('formatTime', () => {
      it('should format with zero-padded hours and minutes', () => {
        const { formatTime } = render24();
        expect(formatTime(9, 5)).toBe('09:05');
      });

      it('should format midnight as 00:00', () => {
        const { formatTime } = render24();
        expect(formatTime(0, 0)).toBe('00:00');
      });

      it('should format 23:59', () => {
        const { formatTime } = render24();
        expect(formatTime(23, 59)).toBe('23:59');
      });
    });

    describe('parseTime', () => {
      it('should parse valid 24h time', () => {
        const { parseTime } = render24();
        expect(parseTime('14:30')).toEqual({ hour: 14, minute: 30 });
      });

      it('should parse midnight', () => {
        const { parseTime } = render24();
        expect(parseTime('00:00')).toEqual({ hour: 0, minute: 0 });
      });

      it('should return null for invalid format', () => {
        const { parseTime } = render24();
        expect(parseTime('invalid')).toBeNull();
      });

      it('should return null for out-of-range hour', () => {
        const { parseTime } = render24();
        expect(parseTime('25:00')).toBeNull();
      });

      it('should return null for out-of-range minute', () => {
        const { parseTime } = render24();
        expect(parseTime('12:60')).toBeNull();
      });
    });

    it('should set isHour12 to false', () => {
      const { isHour12 } = render24();
      expect(isHour12).toBe(false);
    });
  });

  describe('12-hour format', () => {
    const render12 = () =>
      renderHook(() => useTimeInput(TimeFormat.HOUR_12)).result.current;

    describe('formatTime', () => {
      it('should format AM time', () => {
        const { formatTime } = render12();
        expect(formatTime(9, 5)).toBe('09:05 AM');
      });

      it('should format PM time', () => {
        const { formatTime } = render12();
        expect(formatTime(14, 30)).toBe('02:30 PM');
      });

      it('should format midnight as 12:00 AM', () => {
        const { formatTime } = render12();
        expect(formatTime(0, 0)).toBe('12:00 AM');
      });

      it('should format noon as 12:00 PM', () => {
        const { formatTime } = render12();
        expect(formatTime(12, 0)).toBe('12:00 PM');
      });
    });

    describe('parseTime', () => {
      it('should parse AM time', () => {
        const { parseTime } = render12();
        expect(parseTime('09:30 AM')).toEqual({ hour: 9, minute: 30 });
      });

      it('should parse PM time', () => {
        const { parseTime } = render12();
        expect(parseTime('02:30 PM')).toEqual({ hour: 14, minute: 30 });
      });

      it('should parse 12:00 AM as midnight', () => {
        const { parseTime } = render12();
        expect(parseTime('12:00 AM')).toEqual({ hour: 0, minute: 0 });
      });

      it('should parse 12:00 PM as noon', () => {
        const { parseTime } = render12();
        expect(parseTime('12:00 PM')).toEqual({ hour: 12, minute: 0 });
      });

      it('should return null for invalid format', () => {
        const { parseTime } = render12();
        expect(parseTime('14:30')).toBeNull();
      });

      it('should return null for out-of-range hour', () => {
        const { parseTime } = render12();
        expect(parseTime('13:00 AM')).toBeNull();
      });

      it('should return null for out-of-range minute', () => {
        const { parseTime } = render12();
        expect(parseTime('12:60 PM')).toBeNull();
      });
    });

    it('should set isHour12 to true', () => {
      const { isHour12 } = render12();
      expect(isHour12).toBe(true);
    });
  });
});
