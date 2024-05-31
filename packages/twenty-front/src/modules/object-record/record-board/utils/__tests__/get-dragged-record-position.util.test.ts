import { getDraggedRecordPosition } from '../get-dragged-record-position.util';

describe('getDraggedRecordPosition', () => {
  it('should return the average of the two positions', () => {
    expect(getDraggedRecordPosition(1, 3)).toBe(2);
  });

  it('should return the position before the record after', () => {
    expect(getDraggedRecordPosition(undefined, 3)).toBe(2);
  });

  it('should return the position after the record before', () => {
    expect(getDraggedRecordPosition(1, undefined)).toBe(2);
  });

  it('should return 1 if no positions are defined', () => {
    expect(getDraggedRecordPosition(undefined, undefined)).toBe(1);
  });
});
