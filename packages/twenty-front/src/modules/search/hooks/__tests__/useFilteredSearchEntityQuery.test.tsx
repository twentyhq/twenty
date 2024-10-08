import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import {
  query,
  responseData,
  variables,
} from '../__mocks__/useFilteredSearchEntityQuery';
import { useFilteredSearchEntityQuery } from '../useFilteredSearchEntityQuery';

const mocks = [
  {
    request: {
      query,
      variables: variables.entitiesToSelect,
    },
    result: jest.fn(() => ({
      data: {
        people: responseData,
      },
    })),
  },
  {
    request: {
      query,
      variables: variables.filteredSelectedEntities,
    },
    result: jest.fn(() => ({
      data: {
        people: responseData,
      },
    })),
  },
  {
    request: {
      query,
      variables: variables.selectedEntities,
    },
    result: jest.fn(() => ({
      data: {
        people: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

describe('useFilteredSearchEntityQuery', () => {
  it('returns the correct result when everything is provided', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember({
          id: '32219445-f587-4c40-b2b1-6d3205ed96da',
          name: { firstName: 'John', lastName: 'Connor' },
          locale: 'en',
        });

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setMetadataItems(generatedMockObjectMetadataItems);

        return useFilteredSearchEntityQuery({
          orderByField: 'name',
          filters: [{ fieldNames: ['name'], filter: 'Entity' }],
          sortOrder: 'AscNullsLast',
          selectedIds: ['1'],
          limit: 10,
          excludeRecordIds: ['2'],
          objectNameSingular: 'person',
        });
      },
      { wrapper: Wrapper },
    );

    const expectedResult: EntitiesForMultipleEntitySelect<any> = {
      selectedEntities: [],
      filteredSelectedEntities: [],
      entitiesToSelect: [],
      loading: true,
    };

    expect(result.current).toEqual(expectedResult);
  });
});
