import { gql } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  phonesFieldDefinition,
  relationFieldDefinition,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

const query = gql`
  mutation UpdateOnePerson($idToUpdate: ID!, $input: PersonUpdateInput!) {
    updatePerson(id: $idToUpdate, data: $input) {
      ${PERSON_FRAGMENT}
    }
  }
`;

const mocks: MockedResponse[] = [
  {
    request: {
      query,
      variables: {
        idToUpdate: 'recordId',
        input: {
          phones: {
            primaryPhoneNumber: '123 456',
            primaryPhoneCountryCode: '+1',
            additionalPhones: [],
          },
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        updatePerson: {
          id: 'recordId',
        },
      },
    })),
  },
  {
    request: {
      query,
      variables: {
        idToUpdate: 'recordId',
        input: { companyId: 'companyId' },
      },
    },
    result: jest.fn(() => ({
      data: {
        updatePerson: {
          id: 'recordId',
        },
      },
    })),
  },
];

const recordId = 'recordId';

const getWrapper =
  (fieldDefinition: FieldDefinition<FieldMetadata>) =>
  ({ children }: { children: ReactNode }) => {
    const useUpdateOneRecordMutation: RecordUpdateHook = () => {
      const { updateOneRecord } = useUpdateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Person,
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
            fieldDefinition,
            recordId,
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

const PhoneWrapper = getWrapper(phonesFieldDefinition);
const RelationWrapper = getWrapper(relationFieldDefinition);

describe('usePersistField', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const entityFields = useRecoilValue(
          recordStoreFamilySelector({ recordId, fieldName: 'phone' }),
        );

        return {
          persistField: usePersistField(),
          entityFields,
        };
      },
      { wrapper: PhoneWrapper },
    );

    act(() => {
      result.current.persistField({
        primaryPhoneNumber: '123 456',
        primaryPhoneCountryCode: '+1',
        additionalPhones: [],
      });
    });

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });

  it('should persist relation field', async () => {
    const { result } = renderHook(
      () => {
        const entityFields = useRecoilValue(
          recordStoreFamilySelector({
            recordId,
            fieldName: 'company',
          }),
        );

        return {
          persistField: usePersistField(),
          entityFields,
        };
      },
      { wrapper: RelationWrapper },
    );

    act(() => {
      result.current.persistField({ id: 'companyId' });
    });

    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
    });
  });
});
