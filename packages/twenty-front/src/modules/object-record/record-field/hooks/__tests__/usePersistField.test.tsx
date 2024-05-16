import { ReactNode } from 'react';
import { gql } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  phoneFieldDefinition,
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
      __typename
      xLink {
        label
        url
      }
      id
      createdAt
      city
      email
      jobTitle
      name {
        firstName
        lastName
      }
      phone
      linkedinLink {
        label
        url
      }
      updatedAt
      avatarUrl
      companyId
    }
  }
`;

const mocks: MockedResponse[] = [
  {
    request: {
      query,
      variables: { idToUpdate: 'entityId', input: { phone: '+1 123 456' } },
    },
    result: jest.fn(() => ({
      data: {
        updatePerson: {
          id: 'entityId',
        },
      },
    })),
  },
  {
    request: {
      query,
      variables: {
        idToUpdate: 'entityId',
        input: { companyId: 'companyId' },
      },
    },
    result: jest.fn(() => ({
      data: {
        updatePerson: {
          id: 'entityId',
        },
      },
    })),
  },
];

const entityId = 'entityId';

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

const PhoneWrapper = getWrapper(phoneFieldDefinition);
const RelationWrapper = getWrapper(relationFieldDefinition);

describe('usePersistField', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const entityFields = useRecoilValue(
          recordStoreFamilySelector({ recordId: entityId, fieldName: 'phone' }),
        );

        return {
          persistField: usePersistField(),
          entityFields,
        };
      },
      { wrapper: PhoneWrapper },
    );

    act(() => {
      result.current.persistField('+1 123 456');
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
            recordId: entityId,
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
