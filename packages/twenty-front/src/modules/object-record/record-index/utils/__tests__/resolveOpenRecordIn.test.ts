import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { ObjectOpenRecordIn, OpenRecordIn } from 'twenty-shared/types';

const resolve = (
  overrides: Partial<Parameters<typeof resolveOpenRecordIn>[0]>,
) =>
  resolveOpenRecordIn({
    objectOpenRecordIn: ObjectOpenRecordIn.USER_CHOICE,
    openRecordInPreference: OpenRecordIn.SIDE_PANEL,
    canDisplaySidePanel: true,
    ...overrides,
  });

describe('resolveOpenRecordIn', () => {
  describe('when the object leaves the choice to the member', () => {
    it('follows a side panel preference', () => {
      expect(resolve({ openRecordInPreference: OpenRecordIn.SIDE_PANEL })).toBe(
        OpenRecordIn.SIDE_PANEL,
      );
    });

    it('follows a record page preference', () => {
      expect(
        resolve({ openRecordInPreference: OpenRecordIn.RECORD_PAGE }),
      ).toBe(OpenRecordIn.RECORD_PAGE);
    });
  });

  describe('when the object pins a destination', () => {
    it('ignores the member preference for a pinned record page', () => {
      expect(
        resolve({
          objectOpenRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
          openRecordInPreference: OpenRecordIn.SIDE_PANEL,
        }),
      ).toBe(OpenRecordIn.RECORD_PAGE);
    });

    it('ignores the member preference for a pinned side panel', () => {
      expect(
        resolve({
          objectOpenRecordIn: ObjectOpenRecordIn.SIDE_PANEL,
          openRecordInPreference: OpenRecordIn.RECORD_PAGE,
        }),
      ).toBe(OpenRecordIn.SIDE_PANEL);
    });
  });

  describe('when there is no room for a panel', () => {
    it.each([ObjectOpenRecordIn.SIDE_PANEL, ObjectOpenRecordIn.USER_CHOICE])(
      'falls back to the record page (%s)',
      (objectOpenRecordIn) => {
        expect(
          resolve({ objectOpenRecordIn, canDisplaySidePanel: false }),
        ).toBe(OpenRecordIn.RECORD_PAGE);
      },
    );
  });
});
