import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import {
  actorFieldDefinition,
  phonesFieldDefinition,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
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
  it('should take fieldDefinition into account', () => {
    const { result } = renderHook(() => useIsFieldValueReadOnly(), {
      wrapper: getWrapper(phonesFieldDefinition, false),
    });

    expect(result.current).toBe(false);

    const { result: result2 } = renderHook(() => useIsFieldValueReadOnly(), {
      wrapper: getWrapper(actorFieldDefinition, false),
    });

    expect(result2.current).toBe(true);
  });

  it('should take isRecordDeleted into account', () => {
    const { result } = renderHook(() => useIsFieldValueReadOnly(), {
      wrapper: getWrapper(phonesFieldDefinition, true),
    });

    expect(result.current).toBe(true);
  });
});
