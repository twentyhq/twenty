import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { resolveRecordShareGrantsAtDestroyByRecordId } from 'src/engine/core-modules/record-share/utils/resolve-record-share-grants-at-destroy-by-record-id.util';

describe('resolveRecordShareGrantsAtDestroyByRecordId', () => {
  it('should map the grants captured on destroy events and skip events without them', () => {
    const recordShareGrant = {
      recordId: 'destroyed-record-id',
      principalId: 'principal-id',
      accessLevel: RecordShareAccessLevel.READ,
    };
    const events = [
      {
        recordId: 'destroyed-record-id',
        properties: {
          before: { id: 'destroyed-record-id' },
          recordShareGrantsAtDestroy: [recordShareGrant],
        },
      },
      {
        recordId: 'destroyed-record-without-grants-id',
        properties: {
          before: { id: 'destroyed-record-without-grants-id' },
          recordShareGrantsAtDestroy: [],
        },
      },
      {
        recordId: 'updated-record-id',
        properties: { after: { id: 'updated-record-id' } },
      },
    ] as unknown as ObjectRecordEvent[];

    expect(resolveRecordShareGrantsAtDestroyByRecordId(events)).toEqual(
      new Map([
        ['destroyed-record-id', [recordShareGrant]],
        ['destroyed-record-without-grants-id', []],
      ]),
    );
  });
});
