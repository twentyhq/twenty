import { RECORD_LIST_ROW_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMaxWidth';
import { RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH } from '@/object-record/record-list/constants/RecordListRowOverflowChipSlotWidth';
import { computeRecordListDisplayedFields } from '@/object-record/record-list/utils/computeRecordListDisplayedFields';

describe('computeRecordListDisplayedFields', () => {
  it('shows every field while they can fit at their minimum width', () => {
    expect(
      computeRecordListDisplayedFields({
        rowWidth: 524,
        populatedFieldCount: 3,
      }),
    ).toEqual({
      displayedFieldCount: 3,
      displayedFieldMaxWidth: 100,
    });
  });

  it('uses an overflow chip only after every field can no longer fit', () => {
    expect(
      computeRecordListDisplayedFields({
        rowWidth: 523,
        populatedFieldCount: 4,
      }),
    ).toEqual({
      displayedFieldCount: 3,
      displayedFieldMaxWidth: 82,
    });
  });

  it('reserves room for the pinned field before fitting fields', () => {
    expect(
      computeRecordListDisplayedFields({
        rowWidth: 524,
        populatedFieldCount: 3,
        hasPinnedField: true,
      }),
    ).toEqual({
      displayedFieldCount: 1,
      displayedFieldMaxWidth: 104,
    });
  });

  it('returns no field when not even a minimum-width field fits', () => {
    expect(
      computeRecordListDisplayedFields({
        rowWidth: 331,
        populatedFieldCount: 7,
      }).displayedFieldCount,
    ).toBe(0);
  });

  it('does not cap the number of fields that fit', () => {
    expect(
      computeRecordListDisplayedFields({
        rowWidth: 10_000,
        populatedFieldCount: 58,
      }).displayedFieldCount,
    ).toBe(58);
  });

  it('gives fields their full width when the row can afford it', () => {
    expect(
      computeRecordListDisplayedFields({
        rowWidth: 408,
        populatedFieldCount: 1,
      }).displayedFieldMaxWidth,
    ).toBe(156);
  });

  it('narrows fields to fill the available row width', () => {
    expect(
      computeRecordListDisplayedFields({
        rowWidth: 342,
        populatedFieldCount: 2,
      }).displayedFieldMaxWidth,
    ).toBe(90);
  });

  const WIDTH_RESERVED_BEFORE_FIELDS = 200;
  const FIELD_GAP_WIDTH = 12;

  const computeRowContentWidth = ({
    rowWidth,
    populatedFieldCount,
    hasPinnedField,
  }: {
    rowWidth: number;
    populatedFieldCount: number;
    hasPinnedField: boolean;
  }) => {
    const { displayedFieldCount, displayedFieldMaxWidth } =
      computeRecordListDisplayedFields({
        rowWidth,
        populatedFieldCount,
        hasPinnedField,
      });

    const hiddenFieldCount = populatedFieldCount - displayedFieldCount;
    const displayedFieldsGapWidth =
      Math.max(displayedFieldCount - 1, 0) * FIELD_GAP_WIDTH;
    const overflowChipWidth =
      hiddenFieldCount > 0
        ? RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH +
          (displayedFieldCount > 0 ? FIELD_GAP_WIDTH : 0)
        : 0;
    const pinnedFieldWidth = hasPinnedField
      ? RECORD_LIST_ROW_FIELD_MAX_WIDTH +
        (populatedFieldCount > 0 ? FIELD_GAP_WIDTH : 0)
      : 0;

    return (
      WIDTH_RESERVED_BEFORE_FIELDS +
      displayedFieldCount * displayedFieldMaxWidth +
      displayedFieldsGapWidth +
      overflowChipWidth +
      pinnedFieldWidth
    );
  };

  it.each([240, 280, 331, 332, 342, 407, 408, 523, 524, 900, 1200])(
    'never promises a %ipx row more width than it has',
    (rowWidth) => {
      for (const populatedFieldCount of [0, 1, 2, 3, 7, 20]) {
        expect(
          computeRowContentWidth({
            rowWidth,
            populatedFieldCount,
            hasPinnedField: false,
          }),
        ).toBeLessThanOrEqual(rowWidth);
      }
    },
  );

  it.each([408, 424, 499, 500, 523, 524, 900, 1200])(
    'never promises a %ipx row with a pinned field more width than it has',
    (rowWidth) => {
      for (const populatedFieldCount of [0, 1, 2, 3, 7, 20]) {
        expect(
          computeRowContentWidth({
            rowWidth,
            populatedFieldCount,
            hasPinnedField: true,
          }),
        ).toBeLessThanOrEqual(rowWidth);
      }
    },
  );
});
