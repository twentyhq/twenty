import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { ViewOpenRecordIn } from 'twenty-shared/types';

const resolve = (
  overrides: Partial<Parameters<typeof resolveOpenRecordIn>[0]>,
) =>
  resolveOpenRecordIn({
    openRecordInViewSetting: ViewOpenRecordIn.SIDE_PANEL,
    openRecordInUserPreference: ViewOpenRecordIn.SIDE_PANEL,
    objectNameSingular: 'company',
    canDisplaySidePanel: true,
    ...overrides,
  });

describe('resolveOpenRecordIn', () => {
  describe('when the view names a destination', () => {
    it('opens in the side panel when the view asks for it', () => {
      expect(
        resolve({ openRecordInViewSetting: ViewOpenRecordIn.SIDE_PANEL }),
      ).toBe(ViewOpenRecordIn.SIDE_PANEL);
    });

    it('keeps the record page when the view asks for it', () => {
      expect(
        resolve({ openRecordInViewSetting: ViewOpenRecordIn.RECORD_PAGE }),
      ).toBe(ViewOpenRecordIn.RECORD_PAGE);
    });

    it('ignores the member preference', () => {
      expect(
        resolve({
          openRecordInViewSetting: ViewOpenRecordIn.RECORD_PAGE,
          openRecordInUserPreference: ViewOpenRecordIn.SIDE_PANEL,
        }),
      ).toBe(ViewOpenRecordIn.RECORD_PAGE);
    });
  });

  describe('when the view defers to the member', () => {
    it('follows a side panel preference', () => {
      expect(
        resolve({
          openRecordInViewSetting: ViewOpenRecordIn.USER_PREFERENCE,
          openRecordInUserPreference: ViewOpenRecordIn.SIDE_PANEL,
        }),
      ).toBe(ViewOpenRecordIn.SIDE_PANEL);
    });

    it('follows a record page preference', () => {
      expect(
        resolve({
          openRecordInViewSetting: ViewOpenRecordIn.USER_PREFERENCE,
          openRecordInUserPreference: ViewOpenRecordIn.RECORD_PAGE,
        }),
      ).toBe(ViewOpenRecordIn.RECORD_PAGE);
    });
  });

  describe('when the side panel is not a real destination', () => {
    it.each([ViewOpenRecordIn.SIDE_PANEL, ViewOpenRecordIn.USER_PREFERENCE])(
      'falls back to the record page with no room for a panel (%s)',
      (openRecordInViewSetting) => {
        expect(
          resolve({ openRecordInViewSetting, canDisplaySidePanel: false }),
        ).toBe(ViewOpenRecordIn.RECORD_PAGE);
      },
    );

    it.each([ViewOpenRecordIn.SIDE_PANEL, ViewOpenRecordIn.USER_PREFERENCE])(
      'falls back to the record page for objects without one (%s)',
      (openRecordInViewSetting) => {
        expect(
          resolve({ openRecordInViewSetting, objectNameSingular: 'workflow' }),
        ).toBe(ViewOpenRecordIn.RECORD_PAGE);
      },
    );
  });
});
