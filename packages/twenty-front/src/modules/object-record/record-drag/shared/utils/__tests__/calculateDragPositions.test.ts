import { type RecordDragPositionData } from '@/object-record/record-drag/shared/types/RecordDragPositionData';
import { calculateDragPositions } from '@/object-record/record-drag/shared/utils/calculateDragPositions';

describe('calculateDragPositions', () => {
  const mockRecordPositionData: RecordDragPositionData[] = [
    { recordId: 'record-1', position: 1 },
    { recordId: 'record-2', position: 2 },
    { recordId: 'record-3', position: 3 },
    { recordId: 'record-4', position: 4 },
    { recordId: 'record-5', position: 5 },
  ];

  describe('Single record drag', () => {
    it('should calculate position when moving record forward', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4', 'record-5'],
        recordsToMove: ['record-2'],
        destinationIndex: 3,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-2']).toBeGreaterThan(3);
      expect(result['record-2']).toBeLessThan(5);
    });

    it('should calculate position when moving record backward', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4'],
        recordsToMove: ['record-4'],
        destinationIndex: 1,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-4']).toBeGreaterThan(1);
      expect(result['record-4']).toBeLessThan(2);
    });

    it('should handle moving to the beginning', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-3'],
        destinationIndex: 0,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-3']).toBeLessThan(1);
    });

    it('should handle moving to the end', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-1'],
        destinationIndex: 2,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-1']).toBeGreaterThan(3);
    });
  });

  describe('Multi record drag', () => {
    it('should calculate positions for multiple records with proper spacing', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4', 'record-5'],
        recordsToMove: ['record-1', 'record-3'],
        destinationIndex: 3,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-1']).toBeGreaterThan(4);
      expect(result['record-1']).toBeLessThan(5);
      expect(result['record-3']).toBeGreaterThan(result['record-1']);
      expect(result['record-3']).toBeLessThan(5);
    });

    it('should maintain order of dragged records', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4', 'record-5'],
        recordsToMove: ['record-2', 'record-3', 'record-4'],
        destinationIndex: 0,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-2']).toBeLessThan(result['record-3']);
      expect(result['record-3']).toBeLessThan(result['record-4']);
      expect(result['record-4']).toBeLessThan(1);
    });

    it('should handle moving multiple records to the end', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4'],
        recordsToMove: ['record-1', 'record-2'],
        destinationIndex: 2,
        recordPositionData: mockRecordPositionData,
      });

      expect(typeof result['record-1']).toBe('number');
      expect(result['record-2']).toBeGreaterThan(result['record-1']);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined positions', () => {
      const dataWithUndefined: RecordDragPositionData[] = [
        { recordId: 'record-1', position: undefined },
        { recordId: 'record-2', position: 2 },
        { recordId: 'record-3', position: undefined },
      ];

      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-1'],
        destinationIndex: 1,
        recordPositionData: dataWithUndefined,
      });

      expect(typeof result['record-1']).toBe('number');
      expect(isNaN(result['record-1'])).toBe(false);
    });

    it('should handle empty record arrays', () => {
      const result = calculateDragPositions({
        recordIds: [],
        recordsToMove: ['record-1'],
        destinationIndex: 0,
        recordPositionData: [],
      });

      expect(typeof result['record-1']).toBe('number');
    });

    it('should handle negative positions', () => {
      const negativeData: RecordDragPositionData[] = [
        { recordId: 'record-1', position: -5 },
        { recordId: 'record-2', position: -3 },
        { recordId: 'record-3', position: -1 },
      ];

      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-1'],
        destinationIndex: 2,
        recordPositionData: negativeData,
      });

      expect(result['record-1']).toBeGreaterThan(-1);
    });

    it('should handle very small gaps between positions', () => {
      const tightData: RecordDragPositionData[] = [
        { recordId: 'record-1', position: 1 },
        { recordId: 'record-2', position: 1.0001 },
        { recordId: 'record-3', position: 1.0002 },
      ];

      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-3'],
        destinationIndex: 0,
        recordPositionData: tightData,
      });

      expect(result['record-3']).toBeLessThan(1);
    });

    it('should handle single record in list', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1'],
        recordsToMove: ['record-1'],
        destinationIndex: 0,
        recordPositionData: [{ recordId: 'record-1', position: 1 }],
      });

      expect(typeof result['record-1']).toBe('number');
    });

    it('should preserve relative order when moving multiple non-consecutive records', () => {
      const result = calculateDragPositions({
        recordIds: ['record-1', 'record-2', 'record-3', 'record-4', 'record-5'],
        recordsToMove: ['record-1', 'record-3', 'record-5'],
        destinationIndex: 1,
        recordPositionData: mockRecordPositionData,
      });

      const positions = ['record-1', 'record-3', 'record-5'].map(
        (id) => result[id],
      );

      expect(positions[0]).toBeLessThan(positions[1]);
      expect(positions[1]).toBeLessThan(positions[2]);
      expect(typeof positions[2]).toBe('number');
    });
  });
});
