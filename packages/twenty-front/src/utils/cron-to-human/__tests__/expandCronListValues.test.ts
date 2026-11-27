import { expandCronListValues } from '~/utils/cron-to-human/utils/expandCronListValues';

describe('expandCronListValues', () => {
  it('should keep plain list values', () => {
    expect(expandCronListValues('1,3,5')).toEqual(['1', '3', '5']);
  });

  it('should trim list values', () => {
    expect(expandCronListValues('1, 3 ,5')).toEqual(['1', '3', '5']);
  });

  it('should expand ranges inside a list', () => {
    expect(expandCronListValues('1-3,5')).toEqual(['1', '2', '3', '5']);
    expect(expandCronListValues('0,4-6')).toEqual(['0', '4', '5', '6']);
  });

  it('should keep the order of list values', () => {
    expect(expandCronListValues('5,1-3')).toEqual(['5', '1', '2', '3']);
  });

  it('should keep reversed ranges as is', () => {
    expect(expandCronListValues('5-1,3')).toEqual(['5-1', '3']);
  });

  it('should keep non-numeric values as is', () => {
    expect(expandCronListValues('1-3,L')).toEqual(['1', '2', '3', 'L']);
    expect(expandCronListValues('MON-WED,FRI')).toEqual(['MON-WED', 'FRI']);
    expect(expandCronListValues('1-5/2,6')).toEqual(['1-5/2', '6']);
  });
});
