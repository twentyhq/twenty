import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';

describe('getNumberValueToPersist', () => {
  it('should persist a percentage that still has the percent sign', () => {
    expect(
      getNumberValueToPersist({
        newValue: '50%',
        numberType: 'percentage',
      }),
    ).toEqual({ success: true, value: 0.5 });
  });

  it('should persist a percentage typed without the percent sign', () => {
    expect(
      getNumberValueToPersist({
        newValue: '50',
        numberType: 'percentage',
      }),
    ).toEqual({ success: true, value: 0.5 });
  });

  it('should persist an empty percentage as null', () => {
    expect(
      getNumberValueToPersist({
        newValue: '',
        numberType: 'percentage',
      }),
    ).toEqual({ success: true, value: null });
  });

  it('should not persist a percentage that is not numeric', () => {
    expect(
      getNumberValueToPersist({
        newValue: 'abc%',
        numberType: 'percentage',
      }),
    ).toEqual({ success: false });
  });

  it('should persist a plain number', () => {
    expect(
      getNumberValueToPersist({
        newValue: '50',
        numberType: 'number',
      }),
    ).toEqual({ success: true, value: 50 });
  });

  it('should not persist a percent sign on a plain number field', () => {
    expect(
      getNumberValueToPersist({
        newValue: '50%',
        numberType: 'number',
      }),
    ).toEqual({ success: false });
  });
});
