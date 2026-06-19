import { type DocumentNode, visit } from 'graphql';

import { CREATE_ONE_OBJECT_METADATA_ITEM } from '@/object-metadata/graphql/mutations';

const getSelectedFieldNames = (document: DocumentNode): Set<string> => {
  const fieldNames = new Set<string>();

  visit(document, {
    Field(node) {
      fieldNames.add(node.name.value);
    },
  });

  return fieldNames;
};

describe('CREATE_ONE_OBJECT_METADATA_ITEM', () => {
  // The created object is written into the metadata store, where addToDraft
  // replaces entries by id. If this mutation returns a reduced object it can
  // overwrite the fuller record delivered over SSE, leaving object-level flags
  // undefined and making the new object read-only — no "create record"
  // affordance in its table view until a hard refresh. Lock the flags that
  // canCreateRecordsForObjectMetadataItem depends on so the selection cannot
  // silently drift again.
  it('selects the object-level flags that gate record creation', () => {
    const fieldNames = getSelectedFieldNames(CREATE_ONE_OBJECT_METADATA_ITEM);

    for (const requiredField of [
      'isUICreatable',
      'isUIEditable',
      'isSystem',
      'isRemote',
      'applicationId',
    ]) {
      expect(fieldNames.has(requiredField)).toBe(true);
    }
  });
});
