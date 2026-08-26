import { prepareRecordForUpsertUpdate } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/prepare-record-for-upsert-update.util';

describe('prepareRecordForUpsertUpdate', () => {
  it('marks a restored record with manual assignment metadata as manually assigned', () => {
    expect(
      prepareRecordForUpsertUpdate({
        record: {
          id: 'target-id',
          isAutomaticallyAssigned: true,
        },
        hasManualAssignmentField: true,
      }),
    ).toEqual({
      id: 'target-id',
      isAutomaticallyAssigned: true,
      isManuallyAssigned: true,
      deletedAt: null,
    });
  });

  it('does not add target provenance to other objects', () => {
    expect(
      prepareRecordForUpsertUpdate({
        record: { id: 'person-id' },
        hasManualAssignmentField: false,
      }),
    ).toEqual({ id: 'person-id', deletedAt: null });
  });
});
