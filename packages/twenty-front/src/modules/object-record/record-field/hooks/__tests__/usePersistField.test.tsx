import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { responseData } from '@/object-record/hooks/__mocks__/useUpdateOneRecord';
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
import { gql } from '@apollo/client';
import { MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode, act } from 'react';
import { useRecoilValue } from 'recoil';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const query = gql`
  mutation UpdateOnePerson($idToUpdate: UUID!, $input: PersonUpdateInput!) {
    updatePerson(id: $idToUpdate, data: $input) {
      ${PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS}
    }
  }
`;

const phoneMock = {
  primaryPhoneNumber: '123 456',
  primaryPhoneCountryCode: 'US',
  primaryPhoneCallingCode: '+1',
  additionalPhones: [],
};

const mockPersonResponse = { ...responseData, id: 'recordId' };

const mocks: MockedResponse[] = [
  {
    request: {
      query,
      variables: {
        idToUpdate: 'recordId',
        input: {
          phones: phoneMock,
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        updatePerson: mockPersonResponse,
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
        updatePerson: mockPersonResponse,
      },
    })),
  },
];

const recordId = 'recordId';

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

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
      <JestMetadataAndApolloMocksWrapper>
        <FieldContext.Provider
          value={{
            fieldDefinition,
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

const PhoneWrapper = getWrapper(phonesFieldDefinition);
const RelationWrapper = getWrapper(relationFieldDefinition);

describe('usePersistField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const entityFields = useRecoilValue(
          recordStoreFamilySelector({ recordId, fieldName: 'phones' }),
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
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
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

  it('should skip persistence value has not changed', async () => {
    const { result } = renderHook(
      () => {
        const entityFields = useRecoilValue(
          recordStoreFamilySelector({ recordId, fieldName: 'phones' }),
        );

        return {
          persistField: usePersistField(),
          entityFields,
        };
      },
      { wrapper: PhoneWrapper },
    );

    act(() => {
      result.current.persistField(phoneMock);
    });

    await waitFor(() => {
      expect(mocks[0].result).not.toHaveBeenCalled();
    });
  });

  it('should skip persistence when relation field value has not changed', async () => {
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
      expect(mocks[1].result).not.toHaveBeenCalled();
    });
  });
});
