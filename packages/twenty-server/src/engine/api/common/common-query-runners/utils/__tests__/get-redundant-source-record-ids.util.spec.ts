import { getRedundantSourceRecordIds } from 'src/engine/api/common/common-query-runners/utils/get-redundant-source-record-ids.util';

describe('getRedundantSourceRecordIds', () => {
  const survivorPersonId = 'survivor-person-id';
  const sourcePersonId = 'source-person-id';

  it('returns a source record when an equivalent survivor record exists', () => {
    const redundantIds = getRedundantSourceRecordIds({
      records: [
        {
          id: 'survivor-target-id',
          targetPersonId: survivorPersonId,
          noteId: 'note-id',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'source-target-id',
          targetPersonId: sourcePersonId,
          noteId: 'note-id',
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      sourcePersonIds: [sourcePersonId],
      survivorPersonId,
      personRelationIdFieldName: 'targetPersonId',
    });

    expect(redundantIds).toEqual(['source-target-id']);
  });

  it('keeps equivalent records when none already belongs to the survivor', () => {
    const redundantIds = getRedundantSourceRecordIds({
      records: [
        {
          id: 'first-source-target-id',
          targetPersonId: sourcePersonId,
          noteId: 'note-id',
        },
        {
          id: 'second-source-target-id',
          targetPersonId: 'second-source-person-id',
          noteId: 'note-id',
        },
      ],
      sourcePersonIds: [sourcePersonId, 'second-source-person-id'],
      survivorPersonId,
      personRelationIdFieldName: 'targetPersonId',
    });

    expect(redundantIds).toEqual([]);
  });

  it('keeps a source record when a meaningful field differs', () => {
    const redundantIds = getRedundantSourceRecordIds({
      records: [
        {
          id: 'survivor-activity-id',
          targetPersonId: survivorPersonId,
          name: 'linked-note.updated',
          linkedRecordId: 'note-id',
          properties: { diff: { title: { before: 'Old', after: 'New' } } },
        },
        {
          id: 'source-activity-id',
          targetPersonId: sourcePersonId,
          name: 'linked-note.updated',
          linkedRecordId: 'note-id',
          properties: {
            diff: { title: { before: 'Earlier', after: 'Old' } },
          },
        },
      ],
      sourcePersonIds: [sourcePersonId],
      survivorPersonId,
      personRelationIdFieldName: 'targetPersonId',
    });

    expect(redundantIds).toEqual([]);
  });

  it('keeps a source record when its attribution differs', () => {
    const redundantIds = getRedundantSourceRecordIds({
      records: [
        {
          id: 'survivor-target-id',
          targetPersonId: survivorPersonId,
          noteId: 'note-id',
          createdBy: { source: 'API' },
        },
        {
          id: 'source-target-id',
          targetPersonId: sourcePersonId,
          noteId: 'note-id',
          createdBy: { source: 'MANUAL' },
        },
      ],
      sourcePersonIds: [sourcePersonId],
      survivorPersonId,
      personRelationIdFieldName: 'targetPersonId',
    });

    expect(redundantIds).toEqual([]);
  });

  it('only considers records allowed by the caller', () => {
    const redundantIds = getRedundantSourceRecordIds({
      records: [
        {
          id: 'survivor-activity-id',
          targetPersonId: survivorPersonId,
          name: 'person.updated',
          properties: {},
        },
        {
          id: 'source-activity-id',
          targetPersonId: sourcePersonId,
          name: 'person.updated',
          properties: {},
        },
      ],
      sourcePersonIds: [sourcePersonId],
      survivorPersonId,
      personRelationIdFieldName: 'targetPersonId',
      canBeDeduplicated: (record) => record.name === 'message.linked',
    });

    expect(redundantIds).toEqual([]);
  });
});
