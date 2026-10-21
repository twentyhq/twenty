import { FieldMetadataType } from 'twenty-shared/types';

import { isMatchingFieldReferenceFilter } from '@/object-record/record-filter/utils/isMatchingFieldReferenceFilter';

const thread = { lastActivityAt: '2026-10-10T10:00:00.000Z' };

describe('isMatchingFieldReferenceFilter', () => {
  it('compares with a field of the parent record', () => {
    const matchesArchivedAt = (archivedAt: string | null) =>
      isMatchingFieldReferenceFilter({
        value: archivedAt,
        fieldType: FieldMetadataType.DATE_TIME,
        operator: 'ltField',
        fieldReferenceValue: 'thread.lastActivityAt',
        record: { archivedAt },
        parentRecord: thread,
        isWithinNegatedFilter: false,
      });

    expect(matchesArchivedAt('2026-10-09T10:00:00.000Z')).toBe(true);
    expect(matchesArchivedAt('2026-10-11T10:00:00.000Z')).toBe(false);
    expect(matchesArchivedAt(null)).toBe(false);
  });

  it('compares with a field of the same record', () => {
    expect(
      isMatchingFieldReferenceFilter({
        value: 5,
        fieldType: FieldMetadataType.NUMBER,
        operator: 'gteField',
        fieldReferenceValue: 'target',
        record: { score: 5, target: 5 },
        parentRecord: undefined,
        isWithinNegatedFilter: false,
      }),
    ).toBe(true);
  });

  it('excludes a NULL comparison under a negation too, as SQL does', () => {
    const matchesWithNullArchivedAt = (isWithinNegatedFilter: boolean) =>
      isMatchingFieldReferenceFilter({
        value: null,
        fieldType: FieldMetadataType.DATE_TIME,
        operator: 'ltField',
        fieldReferenceValue: 'thread.lastActivityAt',
        record: { archivedAt: null },
        parentRecord: thread,
        isWithinNegatedFilter,
      });

    expect(matchesWithNullArchivedAt(false)).toBe(false);
    expect(matchesWithNullArchivedAt(true)).toBe(true);
  });

  it('compares timestamps down to the microsecond', () => {
    expect(
      isMatchingFieldReferenceFilter({
        value: '2026-10-10T10:00:00.000002Z',
        fieldType: FieldMetadataType.DATE_TIME,
        operator: 'gtField',
        fieldReferenceValue: 'lastActivityAt',
        record: { lastActivityAt: '2026-10-10T10:00:00.000001Z' },
        parentRecord: undefined,
        isWithinNegatedFilter: false,
      }),
    ).toBe(true);
  });

  it('compares big integers without rounding them', () => {
    expect(
      isMatchingFieldReferenceFilter({
        value: '9007199254740993',
        fieldType: FieldMetadataType.NUMERIC,
        operator: 'gtField',
        fieldReferenceValue: 'target',
        record: { target: '9007199254740992' },
        parentRecord: undefined,
        isWithinNegatedFilter: false,
      }),
    ).toBe(true);
  });

  it('keeps the negation parity when the referenced field was not fetched', () => {
    const matchesWithoutParent = (isWithinNegatedFilter: boolean) =>
      isMatchingFieldReferenceFilter({
        value: '2026-10-09T10:00:00.000Z',
        fieldType: FieldMetadataType.DATE_TIME,
        operator: 'ltField',
        fieldReferenceValue: 'thread.lastActivityAt',
        record: {},
        parentRecord: undefined,
        isWithinNegatedFilter,
      });

    expect(matchesWithoutParent(false)).toBe(false);
    expect(matchesWithoutParent(true)).toBe(true);
  });
});
