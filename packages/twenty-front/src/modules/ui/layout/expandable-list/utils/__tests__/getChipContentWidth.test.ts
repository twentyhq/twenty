import { getChipContentWidth } from '@/ui/layout/expandable-list/utils/getChipContentWidth';

describe('getChipContentWidth', () => {
  it('should return proper value', () => {
    expect(getChipContentWidth(0)).toEqual(0);
    expect(getChipContentWidth(1)).toEqual(0);
    expect(getChipContentWidth(2)).toEqual(17);
    expect(getChipContentWidth(20)).toEqual(25);
    expect(getChipContentWidth(200)).toEqual(33);
    expect(getChipContentWidth(2000)).toEqual(41);
    expect(getChipContentWidth(20000)).toEqual(49);
  });
});
