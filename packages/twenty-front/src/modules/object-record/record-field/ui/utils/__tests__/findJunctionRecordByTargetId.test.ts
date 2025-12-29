import { findJunctionRecordByTargetId } from '@/object-record/record-field/ui/utils/findJunctionRecordByTargetId';

describe('findJunctionRecordByTargetId', () => {
  it('should return undefined for empty junction records', () => {
    const result = findJunctionRecordByTargetId({
      junctionRecords: [],
      targetRecordId: 'target-1',
      targetFieldName: 'company',
    });
    expect(result).toBeUndefined();
  });

  it('should find junction record by target field name', () => {
    const junctionRecords = [
      {
        id: 'junction-1',
        company: { id: 'company-1', name: 'Acme Corp' },
      },
      {
        id: 'junction-2',
        company: { id: 'company-2', name: 'Beta Inc' },
      },
    ];

    const result = findJunctionRecordByTargetId({
      junctionRecords,
      targetRecordId: 'company-2',
      targetFieldName: 'company',
    });

    expect(result).toEqual({
      id: 'junction-2',
      company: { id: 'company-2', name: 'Beta Inc' },
    });
  });

  it('should return undefined when target record is not found', () => {
    const junctionRecords = [
      {
        id: 'junction-1',
        company: { id: 'company-1', name: 'Acme Corp' },
      },
    ];

    const result = findJunctionRecordByTargetId({
      junctionRecords,
      targetRecordId: 'non-existent',
      targetFieldName: 'company',
    });

    expect(result).toBeUndefined();
  });

  it('should skip undefined junction records', () => {
    const junctionRecords = [
      undefined,
      {
        id: 'junction-1',
        company: { id: 'company-1', name: 'Acme Corp' },
      },
    ] as any[];

    const result = findJunctionRecordByTargetId({
      junctionRecords,
      targetRecordId: 'company-1',
      targetFieldName: 'company',
    });

    expect(result).toEqual({
      id: 'junction-1',
      company: { id: 'company-1', name: 'Acme Corp' },
    });
  });

  it('should handle null target objects', () => {
    const junctionRecords = [
      {
        id: 'junction-1',
        company: null,
      },
      {
        id: 'junction-2',
        company: { id: 'company-1', name: 'Acme Corp' },
      },
    ];

    const result = findJunctionRecordByTargetId({
      junctionRecords,
      targetRecordId: 'company-1',
      targetFieldName: 'company',
    });

    expect(result).toEqual({
      id: 'junction-2',
      company: { id: 'company-1', name: 'Acme Corp' },
    });
  });

  it('should handle target objects without id property', () => {
    const junctionRecords = [
      {
        id: 'junction-1',
        company: { name: 'No ID Company' },
      },
      {
        id: 'junction-2',
        company: { id: 'company-1', name: 'Acme Corp' },
      },
    ];

    const result = findJunctionRecordByTargetId({
      junctionRecords,
      targetRecordId: 'company-1',
      targetFieldName: 'company',
    });

    expect(result).toEqual({
      id: 'junction-2',
      company: { id: 'company-1', name: 'Acme Corp' },
    });
  });

  it('should work with different target field names', () => {
    const junctionRecords = [
      {
        id: 'junction-1',
        person: { id: 'person-1', name: 'John Doe' },
        company: { id: 'company-1', name: 'Acme Corp' },
      },
    ];

    const personResult = findJunctionRecordByTargetId({
      junctionRecords,
      targetRecordId: 'person-1',
      targetFieldName: 'person',
    });
    expect(personResult?.id).toBe('junction-1');

    const companyResult = findJunctionRecordByTargetId({
      junctionRecords,
      targetRecordId: 'company-1',
      targetFieldName: 'company',
    });
    expect(companyResult?.id).toBe('junction-1');
  });
});

