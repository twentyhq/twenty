import { getDraggedRecordPosition } from '../getDraggedRecordPosition';

describe('getDraggedRecordPosition', () => {
  it('when both records defined and positive, should return the average of the two positions', () => {
    expect(getDraggedRecordPosition(1, 3)).toBe(2);
  });

  it('when both records defined and negative, should return the average of the two positions', () => {
    expect(getDraggedRecordPosition(-3, -1)).toBe(-2);
  });

  it('when both records defined and one negative, should return the average of the two positions', () => {
    expect(getDraggedRecordPosition(-1, 3)).toBe(1);
  });

  it('when only record after, should return the position - 1', () => {
    expect(getDraggedRecordPosition(undefined, 3)).toBe(2);
  });

  it('when only record before, should return the position + 1', () => {
    expect(getDraggedRecordPosition(1, undefined)).toBe(2);
  });

  it('when both records undefined, should return 1', () => {
    expect(getDraggedRecordPosition(undefined, undefined)).toBe(1);
  });
});
