import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeAlsoLinkedFrom } from '@/object-record/record-relations/utils/computeAlsoLinkedFrom';
import { FieldMetadataType } from 'twenty-shared/types';

const personField = {
  id: 'field-person',
  name: 'person',
  type: FieldMetadataType.RELATION,
} as FieldMetadataItem;

describe('computeAlsoLinkedFrom', () => {
  it('lists other page records that share a relation target and sorts by shared count', () => {
    const records = [
      {
        id: 'note-a',
        person: { id: 'person-1' },
      },
      {
        id: 'note-b',
        person: { id: 'person-1' },
      },
      {
        id: 'note-c',
        person: { id: 'person-2' },
      },
    ];

    const byId = computeAlsoLinkedFrom(records, [personField]);

    expect(byId.get('note-a')?.map((hit) => hit.recordId)).toEqual(['note-b']);
    expect(byId.get('note-b')?.map((hit) => hit.recordId)).toEqual(['note-a']);
    expect(byId.get('note-c')).toEqual([]);
  });
});
