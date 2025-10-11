import { type MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { act, type ReactNode } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateUpdateOneRecordMutation } from '@/object-metadata/utils/generateUpdateOneRecordMutation';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { booleanFieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import {
  FieldContext,
  type RecordUpdateHook,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { useToggleEditOnlyInput } from '@/object-record/record-field/ui/hooks/useToggleEditOnlyInput';
import { generateEmptyJestRecordNode } from '~/testing/jest/generateEmptyJestRecordNode';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const recordId = 'recordId';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const updateOneCompanyMutation = generateUpdateOneRecordMutation({
  objectMetadataItem: companyObjectMetadataItem,
  objectMetadataItems: generatedMockObjectMetadataItems,
  computeReferences: false,
  objectPermissionsByObjectMetadataId: {},
});

const mocks: MockedResponse[] = [
  {
    request: {
      query: updateOneCompanyMutation,
      variables: {
        idToUpdate: 'recordId',
        input: { idealCustomerProfile: true },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateCompany: {
          ...generateEmptyJestRecordNode({
            objectNameSingular: CoreObjectNameSingular.Company,
            input: { id: recordId },
            withDepthOneRelation: true,
          }),
        },
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => {
  const useUpdateOneRecordMutation: RecordUpdateHook = () => {
    const { updateOneRecord } = useUpdateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Company,
    });

    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({
      apolloMocks: mocks,
    });

  return (
    <JestMetadataAndApolloMocksWrapper>
      <FieldContext.Provider
        value={{
          fieldDefinition: booleanFieldDefinition,
          recordId,
          isLabelIdentifier: false,
          useUpdateRecord: useUpdateOneRecordMutation,
          isRecordFieldReadOnly: false,
        }}
      >
        {children}
      </FieldContext.Provider>
    </JestMetadataAndApolloMocksWrapper>
  );
};

describe('useToggleEditOnlyInput', () => {
  it('should toggle field', async () => {
    const { result } = renderHook(
      () => ({ toggleField: useToggleEditOnlyInput() }),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.toggleField();
    });

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });
});
