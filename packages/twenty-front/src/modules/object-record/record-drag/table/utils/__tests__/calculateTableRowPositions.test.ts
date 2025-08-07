import { calculateTableRowPositions } from '@/object-record/record-drag/table/utils/calculateTableRowPositions';

describe('calculateTableRowPositions', () => {
  const mockRecordPositionData = [
    { recordId: 'record-1', position: 1 },
    { recordId: 'record-2', position: 2 },
    { recordId: 'record-3', position: 3 },
    { recordId: 'record-4', position: 4 },
    { recordId: 'record-5', position: 5 },
  ];

  describe('Single drag scenarios', () => {
    it('should calculate single record position correctly', () => {
      const result = calculateTableRowPositions({
        allRecordIds: [
          'record-1',
          'record-2',
          'record-3',
          'record-4',
          'record-5',
        ],
        recordsToMove: ['record-2'],
        destinationIndex: 3,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-2']).toBeGreaterThan(4);
      expect(result['record-2']).toBeLessThan(5);
    });

    it('should handle moving record to beginning', () => {
      const result = calculateTableRowPositions({
        allRecordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-3'],
        destinationIndex: 0,
        recordPositionData: [
          { recordId: 'record-1', position: 10 },
          { recordId: 'record-2', position: 20 },
          { recordId: 'record-3', position: 30 },
        ],
      });

      expect(result['record-3']).toBeLessThan(10);
    });

    it('should handle moving record to end', () => {
      const result = calculateTableRowPositions({
        allRecordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-1'],
        destinationIndex: 2,
        recordPositionData: [
          { recordId: 'record-1', position: 10 },
          { recordId: 'record-2', position: 20 },
          { recordId: 'record-3', position: 30 },
        ],
      });

      expect(result['record-1']).toBeGreaterThan(30);
    });

    it('should handle moving record backward (higher to lower index)', () => {
      const result = calculateTableRowPositions({
        allRecordIds: [
          'record-1',
          'record-2',
          'record-3',
          'record-4',
          'record-5',
        ],
        recordsToMove: ['record-5'],
        destinationIndex: 1,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-5']).toBeGreaterThan(1);
      expect(result['record-5']).toBeLessThan(2);
    });

    it('should handle moving record forward (lower to higher index)', () => {
      const result = calculateTableRowPositions({
        allRecordIds: [
          'record-1',
          'record-2',
          'record-3',
          'record-4',
          'record-5',
        ],
        recordsToMove: ['record-1'],
        destinationIndex: 3,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-1']).toBeGreaterThan(4);
      expect(result['record-1']).toBeLessThan(5);
    });
  });

  describe('Multi-drag scenarios', () => {
    it('should calculate multiple record positions with proportional spacing', () => {
      const result = calculateTableRowPositions({
        allRecordIds: [
          'record-1',
          'record-2',
          'record-3',
          'record-4',
          'record-5',
        ],
        recordsToMove: ['record-1', 'record-3'],
        destinationIndex: 3,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-1']).toBeGreaterThan(4);
      expect(result['record-1']).toBeLessThan(5);
      expect(result['record-3']).toBeGreaterThan(4);
      expect(result['record-3']).toBeLessThan(5);
      expect(result['record-1']).toBeLessThan(result['record-3']);
    });

    it('should handle non-contiguous multi-record selection', () => {
      const allRecordIds = [
        'record-1',
        'record-2',
        'record-3',
        'record-4',
        'record-5',
        'record-6',
      ];
      const recordPositionData = [
        { recordId: 'record-1', position: 1 },
        { recordId: 'record-2', position: 2 },
        { recordId: 'record-3', position: 3 },
        { recordId: 'record-4', position: 4 },
        { recordId: 'record-5', position: 5 },
        { recordId: 'record-6', position: 6 },
      ];

      const result = calculateTableRowPositions({
        allRecordIds,
        recordsToMove: ['record-1', 'record-3', 'record-5'],
        destinationIndex: 1,
        recordPositionData,
      });
      expect(result['record-1']).toBeGreaterThan(2);
      expect(result['record-1']).toBeLessThan(4);
      expect(result['record-3']).toBeGreaterThan(2);
      expect(result['record-3']).toBeLessThan(4);
      expect(result['record-5']).toBeGreaterThan(2);
      expect(result['record-5']).toBeLessThan(4);

      expect(result['record-1']).toBeLessThan(result['record-3']);
      expect(result['record-3']).toBeLessThan(result['record-5']);
    });

    it('should handle contiguous block of records', () => {
      const result = calculateTableRowPositions({
        allRecordIds: [
          'record-1',
          'record-2',
          'record-3',
          'record-4',
          'record-5',
        ],
        recordsToMove: ['record-2', 'record-3', 'record-4'],
        destinationIndex: 0,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-2']).toBeLessThan(1);
      expect(result['record-3']).toBeLessThan(1);
      expect(result['record-4']).toBeLessThan(1);

      expect(result['record-2']).toBeLessThan(result['record-3']);
      expect(result['record-3']).toBeLessThan(result['record-4']);
    });

    it('should handle multi-drag to end of list', () => {
      const result = calculateTableRowPositions({
        allRecordIds: [
          'record-1',
          'record-2',
          'record-3',
          'record-4',
          'record-5',
        ],
        recordsToMove: ['record-1', 'record-2'],
        destinationIndex: 4,
        recordPositionData: mockRecordPositionData,
      });

      expect(result['record-1']).toBeGreaterThan(5);
      expect(result['record-2']).toBeGreaterThan(5);
      expect(result['record-1']).toBeLessThan(result['record-2']);
    });

    it('should handle all records being moved', () => {
      const allRecordIds = ['record-1', 'record-2', 'record-3'];
      const result = calculateTableRowPositions({
        allRecordIds,
        recordsToMove: allRecordIds,
        destinationIndex: 0,
        recordPositionData: [
          { recordId: 'record-1', position: 1 },
          { recordId: 'record-2', position: 2 },
          { recordId: 'record-3', position: 3 },
        ],
      });

      expect(result['record-1']).toBeDefined();
      expect(result['record-2']).toBeDefined();
      expect(result['record-3']).toBeDefined();
      expect(typeof result['record-1']).toBe('number');
      expect(typeof result['record-2']).toBe('number');
      expect(typeof result['record-3']).toBe('number');
    });
  });

  describe('Edge cases', () => {
    it('should handle destinationIndex 0 (very beginning)', () => {
      const result = calculateTableRowPositions({
        allRecordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-3'],
        destinationIndex: 0,
        recordPositionData: [
          { recordId: 'record-1', position: 10 },
          { recordId: 'record-2', position: 20 },
          { recordId: 'record-3', position: 30 },
        ],
      });

      expect(result['record-3']).toBeLessThan(10);
    });

    it('should handle records with undefined positions', () => {
      const recordPositionDataWithUndefined = [
        { recordId: 'record-1', position: 1 },
        { recordId: 'record-2', position: undefined },
        { recordId: 'record-3', position: 3 },
      ];

      const result = calculateTableRowPositions({
        allRecordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-2'],
        destinationIndex: 1,
        recordPositionData: recordPositionDataWithUndefined,
      });

      expect(result['record-2']).toBeDefined();
      expect(typeof result['record-2']).toBe('number');
      expect(isFinite(result['record-2'])).toBe(true);
    });

    it('should handle very small gaps between positions', () => {
      const tightPositionData = [
        { recordId: 'record-1', position: 1.000000000000001 },
        { recordId: 'record-2', position: 1.000000000000002 },
        { recordId: 'record-3', position: 1.000000000000003 },
      ];

      const result = calculateTableRowPositions({
        allRecordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-2'],
        destinationIndex: 1,
        recordPositionData: tightPositionData,
      });

      expect(result['record-2']).toBeGreaterThan(1.000000000000001);
      expect(result['record-2']).toBeLessThan(1.000000000000003);
    });

    it('should handle negative positions', () => {
      const result = calculateTableRowPositions({
        allRecordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-3'],
        destinationIndex: 0,
        recordPositionData: [
          { recordId: 'record-1', position: -10 },
          { recordId: 'record-2', position: -5 },
          { recordId: 'record-3', position: 0 },
        ],
      });

      expect(result['record-3']).toBeLessThan(-10);
    });

    it('should handle zero positions', () => {
      const result = calculateTableRowPositions({
        allRecordIds: ['record-1', 'record-2', 'record-3'],
        recordsToMove: ['record-1'],
        destinationIndex: 1,
        recordPositionData: [
          { recordId: 'record-1', position: 0 },
          { recordId: 'record-2', position: 0 },
          { recordId: 'record-3', position: 0 },
        ],
      });

      expect(typeof result['record-1']).toBe('number');
      expect(isFinite(result['record-1'])).toBe(true);
    });

    it('should handle large number of records being moved', () => {
      const manyRecords = Array.from({ length: 50 }, (_, i) => `record-${i}`);
      const manyPositionData = manyRecords.map((id, i) => ({
        recordId: id,
        position: i,
      }));
      const recordsToMove = manyRecords.slice(0, 25);

      const result = calculateTableRowPositions({
        allRecordIds: manyRecords,
        recordsToMove,
        destinationIndex: 12,
        recordPositionData: manyPositionData,
      });

      expect(Object.keys(result)).toHaveLength(25);

      const positions = recordsToMove
        .map((id) => result[id])
        .sort((a, b) => a - b);
      expect(positions).toEqual(recordsToMove.map((id) => result[id]));
    });

    it('should simulate actual drag from react-beautiful-dnd', () => {
      const result = calculateTableRowPositions({
        allRecordIds: ['row-1', 'row-2', 'row-3', 'row-4', 'row-5'],
        recordsToMove: ['row-2'],
        destinationIndex: 3,
        recordPositionData: [
          { recordId: 'row-1', position: 1.0 },
          { recordId: 'row-2', position: 2.0 },
          { recordId: 'row-3', position: 3.0 },
          { recordId: 'row-4', position: 4.0 },
          { recordId: 'row-5', position: 5.0 },
        ],
      });

      expect(result['row-2']).toBeGreaterThan(4.0);
      expect(result['row-2']).toBeLessThan(5.0);
    });

    it('should simulate multi-select drag from react-beautiful-dnd', () => {
      const result = calculateTableRowPositions({
        allRecordIds: ['row-1', 'row-2', 'row-3', 'row-4', 'row-5'],
        recordsToMove: ['row-1', 'row-3'],
        destinationIndex: 3,
        recordPositionData: [
          { recordId: 'row-1', position: 1.0 },
          { recordId: 'row-2', position: 2.0 },
          { recordId: 'row-3', position: 3.0 },
          { recordId: 'row-4', position: 4.0 },
          { recordId: 'row-5', position: 5.0 },
        ],
      });

      expect(result['row-1']).toBeGreaterThan(4.0);
      expect(result['row-1']).toBeLessThan(5.0);
      expect(result['row-3']).toBeGreaterThan(4.0);
      expect(result['row-3']).toBeLessThan(5.0);
      expect(result['row-1']).toBeLessThan(result['row-3']);
    });
  });
});
