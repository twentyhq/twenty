import { resolveRelatedPeopleFromSourceRecords } from '@/activities/emails/related-people/utils/resolveRelatedPeopleFromSourceRecords';

describe('resolveRelatedPeopleFromSourceRecords', () => {
  it('should return one recipient per source record when every record links to a distinct person', () => {
    const result = resolveRelatedPeopleFromSourceRecords([
      { id: 'source-1', label: 'Mentorship A', relatedPersonId: 'person-1' },
      { id: 'source-2', label: 'Mentorship B', relatedPersonId: 'person-2' },
    ]);

    expect(result.personIds).toEqual(['person-1', 'person-2']);
    expect(result.sourceRecordLabelsByPersonId).toEqual({
      'person-1': ['Mentorship A'],
      'person-2': ['Mentorship B'],
    });
    expect(result.sourceRecordLabelsWithoutRelatedPerson).toEqual([]);
  });

  it('should deduplicate a person shared by several source records while keeping every label', () => {
    const result = resolveRelatedPeopleFromSourceRecords([
      { id: 'source-1', label: 'Mentorship A', relatedPersonId: 'person-1' },
      { id: 'source-2', label: 'Mentorship B', relatedPersonId: 'person-1' },
      { id: 'source-3', label: 'Mentorship C', relatedPersonId: 'person-2' },
    ]);

    expect(result.personIds).toEqual(['person-1', 'person-2']);
    expect(result.sourceRecordLabelsByPersonId).toEqual({
      'person-1': ['Mentorship A', 'Mentorship B'],
      'person-2': ['Mentorship C'],
    });
  });

  it('should preserve the order source records were given in', () => {
    const result = resolveRelatedPeopleFromSourceRecords([
      { id: 'source-1', label: 'Third', relatedPersonId: 'person-3' },
      { id: 'source-2', label: 'First', relatedPersonId: 'person-1' },
      { id: 'source-3', label: 'Second', relatedPersonId: 'person-2' },
    ]);

    expect(result.personIds).toEqual(['person-3', 'person-1', 'person-2']);
  });

  it('should collect source records whose relation is empty instead of dropping them silently', () => {
    const result = resolveRelatedPeopleFromSourceRecords([
      { id: 'source-1', label: 'Mentorship A', relatedPersonId: 'person-1' },
      { id: 'source-2', label: 'Mentorship B', relatedPersonId: null },
      { id: 'source-3', label: 'Mentorship C', relatedPersonId: '' },
    ]);

    expect(result.personIds).toEqual(['person-1']);
    expect(result.sourceRecordLabelsWithoutRelatedPerson).toEqual([
      'Mentorship B',
      'Mentorship C',
    ]);
  });

  it('should return an empty resolution for no source records', () => {
    const result = resolveRelatedPeopleFromSourceRecords([]);

    expect(result).toEqual({
      personIds: [],
      sourceRecordLabelsByPersonId: {},
      sourceRecordLabelsWithoutRelatedPerson: [],
    });
  });
});
