import { renderHook } from '@testing-library/react';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import {
  type ObjectPermissions,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');
const noteObjectMetadataItem = getMockObjectMetadataItemOrThrow('note');

const buildObjectPermissions = ({
  objectMetadataItem,
  title,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  title: string;
}): ObjectPermissions & { objectMetadataId: string } => {
  const titleFieldMetadataItem = objectMetadataItem.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === 'title',
  );

  if (!titleFieldMetadataItem) {
    throw new Error(
      `Title field not found for ${objectMetadataItem.nameSingular}`,
    );
  }

  return {
    objectMetadataId: objectMetadataItem.id,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    rowLevelPermissionPredicates: [
      {
        id: `${objectMetadataItem.id}-title-predicate`,
        fieldMetadataId: titleFieldMetadataItem.id,
        objectMetadataId: objectMetadataItem.id,
        operand: RowLevelPermissionPredicateOperand.CONTAINS,
        value: title,
        subFieldName: null,
        workspaceMemberFieldMetadataId: null,
        workspaceMemberSubFieldName: null,
        roleId: 'role-id',
      },
    ],
    rowLevelPermissionPredicateGroups: [],
  };
};

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
  onInitializeJotaiStore: (store) => {
    store.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      objectsPermissions: [
        buildObjectPermissions({
          objectMetadataItem: taskObjectMetadataItem,
          title: 'Task from RLS',
        }),
        buildObjectPermissions({
          objectMetadataItem: noteObjectMetadataItem,
          title: 'Note from RLS',
        }),
      ],
    });
  },
});

describe('useBuildRecordInputFromRLSPredicates', () => {
  it('uses the object metadata provided for each builder call', () => {
    const { result } = renderHook(
      () => useBuildRecordInputFromRLSPredicates(),
      { wrapper: Wrapper },
    );

    expect(
      result.current.buildRecordInputFromRLSPredicates({
        objectMetadataItem: taskObjectMetadataItem,
      }),
    ).toEqual({ title: 'Task from RLS' });

    expect(
      result.current.buildRecordInputFromRLSPredicates({
        objectMetadataItem: noteObjectMetadataItem,
      }),
    ).toEqual({ title: 'Note from RLS' });
  });
});
