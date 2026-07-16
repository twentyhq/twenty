import { convertUpdateViewInputToGql } from '@/views/utils/convertUpdateViewInputToGql';

describe('convertUpdateViewInputToGql', () => {
  it('includes a null calendar end field so it can be cleared', () => {
    expect(
      convertUpdateViewInputToGql({ calendarEndFieldMetadataId: null }),
    ).toEqual({
      calendarEndFieldMetadataId: null,
      id: undefined,
    });
  });

  it('omits an undefined calendar end field', () => {
    expect(convertUpdateViewInputToGql({})).toEqual({ id: undefined });
  });
});
