import { movePendingRecordTargetToDraftKey } from '@/ai/utils/movePendingRecordTargetToDraftKey';

const COMPANY_TARGET = {
  objectNameSingular: 'company',
  recordId: '20202020-0000-4000-8000-000000000002',
};
const PERSON_TARGET = {
  objectNameSingular: 'person',
  recordId: '20202020-0000-4000-8000-000000000003',
};

describe('movePendingRecordTargetToDraftKey', () => {
  it('moves the pending record to the new draft key and keeps the others', () => {
    expect(
      movePendingRecordTargetToDraftKey({
        pendingRecordTargetByDraftKey: {
          'new-chat': COMPANY_TARGET,
          'other-thread': PERSON_TARGET,
        },
        fromDraftKey: 'new-chat',
        toDraftKey: 'thread',
      }),
    ).toEqual({ thread: COMPANY_TARGET, 'other-thread': PERSON_TARGET });
  });

  it('leaves the pending records alone when the draft had none', () => {
    expect(
      movePendingRecordTargetToDraftKey({
        pendingRecordTargetByDraftKey: { 'other-thread': PERSON_TARGET },
        fromDraftKey: 'new-chat',
        toDraftKey: 'thread',
      }),
    ).toEqual({ 'other-thread': PERSON_TARGET });
  });

  it('keeps the pending record when it already sits under the draft key', () => {
    expect(
      movePendingRecordTargetToDraftKey({
        pendingRecordTargetByDraftKey: { thread: COMPANY_TARGET },
        fromDraftKey: 'thread',
        toDraftKey: 'thread',
      }),
    ).toEqual({ thread: COMPANY_TARGET });
  });
});
