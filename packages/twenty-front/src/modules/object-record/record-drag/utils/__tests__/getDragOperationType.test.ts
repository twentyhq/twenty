import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';

describe('getDragOperationType', () => {
  it('should return single when dragged record is not selected', () => {
    const result = getDragOperationType({
      draggedRecordId: 'record-1',
      selectedRecordIds: ['record-2', 'record-3'],
    });

    expect(result).toBe('single');
  });

  it('should return single when dragged record is selected but only one record is selected', () => {
    const result = getDragOperationType({
      draggedRecordId: 'record-1',
      selectedRecordIds: ['record-1'],
    });

    expect(result).toBe('single');
  });

  it('should return multi when dragged record is selected and multiple records are selected', () => {
    const result = getDragOperationType({
      draggedRecordId: 'record-1',
      selectedRecordIds: ['record-1', 'record-2', 'record-3'],
    });

    expect(result).toBe('multi');
  });

  it('should return single when no records are selected', () => {
    const result = getDragOperationType({
      draggedRecordId: 'record-1',
      selectedRecordIds: [],
    });

    expect(result).toBe('single');
  });

  it('should return multi when dragged record is in middle of selection', () => {
    const result = getDragOperationType({
      draggedRecordId: 'record-2',
      selectedRecordIds: ['record-1', 'record-2', 'record-3'],
    });

    expect(result).toBe('multi');
  });

  it('should return multi when dragged record is last in selection', () => {
    const result = getDragOperationType({
      draggedRecordId: 'record-3',
      selectedRecordIds: ['record-1', 'record-2', 'record-3'],
    });

    expect(result).toBe('multi');
  });
});
