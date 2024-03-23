import { ReactNode } from 'react';
import { gql } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { booleanFieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';

const entityId = 'entityId';

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation UpdateOneCompany(
          $idToUpdate: ID!
          $input: CompanyUpdateInput!
        ) {
          updateCompany(id: $idToUpdate, data: $input) {
            __typename
            xLink {
              label
              url
            }
            linkedinLink {
              label
              url
            }
            domainName
            annualRecurringRevenue {
              amountMicros
              currencyCode
            }
            createdAt
            address
            updatedAt
            name
            accountOwnerId
            employees
            id
            idealCustomerProfile
          }
        }
      `,
      variables: {
        idToUpdate: 'entityId',
        input: { idealCustomerProfile: true },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateWorkspaceMember: {
          id: 'entityId',
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

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <FieldContext.Provider
        value={{
          fieldDefinition: booleanFieldDefinition,
          entityId,
          hotkeyScope: 'hotkeyScope',
          isLabelIdentifier: false,
          useUpdateRecord: useUpdateOneRecordMutation,
        }}
      >
        <RecoilRoot>{children}</RecoilRoot>
      </FieldContext.Provider>
    </MockedProvider>
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
