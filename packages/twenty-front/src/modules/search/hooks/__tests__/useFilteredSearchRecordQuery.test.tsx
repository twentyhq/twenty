import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

import { MultipleRecordPickerRecords } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerRecords';
import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import {
  query,
  responseData,
  variables,
} from '../__mocks__/useFilteredSearchRecordQuery';
import { useFilteredSearchRecordQuery } from '../useFilteredSearchRecordQuery';

const mocks = [
  {
    request: {
      query,
      variables: variables.recordsToSelect,
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
      variables: variables.filteredSelectedRecords,
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
      <SnackBarComponentInstanceContext.Provider
        value={{ instanceId: 'snack-bar-manager' }}
      >
        {children}
      </SnackBarComponentInstanceContext.Provider>
    </MockedProvider>
  </RecoilRoot>
);

describe('useFilteredSearchRecordQuery', () => {
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
          colorScheme: 'Light',
          userEmail: 'userEmail',
        });

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setMetadataItems(generatedMockObjectMetadataItems);

        return useFilteredSearchRecordQuery({
          selectedIds: ['1'],
          limit: 10,
          excludedRecordIds: ['2'],
          objectNameSingular: 'person',
          searchFilter: 'Entity',
        });
      },
      { wrapper: Wrapper },
    );

    const expectedResult: MultipleRecordPickerRecords<any> = {
      selectedRecords: [],
      filteredSelectedRecords: [],
      recordsToSelect: [],
      loading: true,
    };

    expect(result.current).toEqual(expectedResult);
  });
});
