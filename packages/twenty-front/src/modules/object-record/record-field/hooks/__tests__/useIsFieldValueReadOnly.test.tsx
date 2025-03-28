import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { phonesFieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { JestRecordStoreSetter } from '~/testing/jest/JestRecordStoreSetter';

import { useIsFieldValueReadOnly } from '../useIsFieldValueReadOnly';

const recordId = 'recordId';
const mockInstanceId = 'mock-instance-id';

const getWrapper =
  (fieldDefinition: FieldDefinition<FieldMetadata>, isRecordDeleted: boolean) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <RecoilRoot>
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: mockInstanceId }}
        >
          <JestObjectMetadataItemSetter>
            <JestRecordStoreSetter
              records={[
                {
                  id: recordId,
                  deletedAt: isRecordDeleted ? new Date().toISOString() : null,
                  __typename: 'standardObject',
                } as ObjectRecord,
              ]}
            >
              <FieldContext.Provider
                value={{
                  fieldDefinition,
                  recordId,
                  hotkeyScope: 'hotkeyScope',
                  isLabelIdentifier: false,
                  isReadOnly: false,
                }}
              >
                {children}
              </FieldContext.Provider>
            </JestRecordStoreSetter>
          </JestObjectMetadataItemSetter>
        </ContextStoreComponentInstanceContext.Provider>
      </RecoilRoot>
    );
  };

describe('useIsFieldValueReadOnly', () => {
  it('should return true if the field is read only', () => {
    const { result } = renderHook(() =>
      useIsFieldValueReadOnly({
        fieldDefinition: phonesFieldDefinition,
        isRecordReadOnly: false,
      }),
    );

    expect(result.current).toBe(false);
  });

  it('should return false if the field is not read only', () => {
    const { result } = renderHook(() =>
      useIsFieldValueReadOnly({
        fieldDefinition: phonesFieldDefinition,
        isRecordReadOnly: false,
      }),
    );

    expect(result.current).toBe(false);
  });

  it('should return true if the record is read only', () => {
    const { result } = renderHook(() =>
      useIsFieldValueReadOnly({
        fieldDefinition: phonesFieldDefinition,
        isRecordReadOnly: true,
      }),
    );

    expect(result.current).toBe(true);
  });
});
