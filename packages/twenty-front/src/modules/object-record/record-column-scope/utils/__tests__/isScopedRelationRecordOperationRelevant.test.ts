import { isScopedRelationRecordOperationRelevant } from '@/object-record/record-column-scope/utils/isScopedRelationRecordOperationRelevant';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';

const PERSON_OBJECT_ID = 'person-object';
const LOADED_COMPANY_ID = 'loaded-company';

const isRelevant = ({
  operation,
  operationObjectMetadataItemId = PERSON_OBJECT_ID,
}: {
  operation: ObjectRecordOperation;
  operationObjectMetadataItemId?: string;
}) =>
  isScopedRelationRecordOperationRelevant({
    operation,
    operationObjectMetadataItemId,
    scopedRelationAliases: [
      {
        relationObjectMetadataItem: { id: PERSON_OBJECT_ID },
        relationJoinColumnName: 'companyId',
      } as Parameters<
        typeof isScopedRelationRecordOperationRelevant
      >[0]['scopedRelationAliases'][number],
    ],
    isRecordLoaded: (recordId) => recordId === LOADED_COMPANY_ID,
  });

const buildCreatedPerson = (
  person: Record<string, unknown>,
): ObjectRecordOperation => ({
  type: 'create-one',
  createdRecord: { id: 'person', __typename: 'Person', ...person },
});

describe('isScopedRelationRecordOperationRelevant', () => {
  it('ignores an operation on an object no scoped column shows', () => {
    expect(
      isRelevant({
        operation: { type: 'delete-one', deletedRecordId: 'task' },
        operationObjectMetadataItemId: 'task-object',
      }),
    ).toBe(false);
  });

  it.each([
    {
      title: 'a record created under a loaded row',
      operation: buildCreatedPerson({ companyId: LOADED_COMPANY_ID }),
      expected: true,
    },
    {
      title: 'a record created under a row that is not loaded',
      operation: buildCreatedPerson({ companyId: 'other-company' }),
      expected: false,
    },
    {
      title: 'a record created without a parent',
      operation: buildCreatedPerson({ companyId: null }),
      expected: false,
    },
    {
      title: 'a created record that does not carry its join column',
      operation: buildCreatedPerson({}),
      expected: true,
    },
    {
      title: 'an operation that does not carry the written record',
      operation: {
        type: 'delete-one',
        deletedRecordId: 'person',
      } satisfies ObjectRecordOperation,
      expected: true,
    },
  ])('returns $expected for $title', ({ operation, expected }) => {
    expect(isRelevant({ operation })).toBe(expected);
  });
});
