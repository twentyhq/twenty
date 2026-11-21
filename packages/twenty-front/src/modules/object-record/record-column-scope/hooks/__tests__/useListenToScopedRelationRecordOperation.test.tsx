import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useListenToScopedRelationRecordOperation } from '@/object-record/record-column-scope/hooks/useListenToScopedRelationRecordOperation';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');

const peopleAlias: ScopedRelationAlias = {
  recordFieldId: 'people-column',
  responseKey: 'people_scoped',
  relationFieldName: 'people',
  relationObjectMetadataItem: personObjectMetadataItem,
};

const renderListener = (scopedRelationAliases: ScopedRelationAlias[]) => {
  const onScopedRelationRecordOperation = jest.fn();

  renderHook(
    () =>
      useListenToScopedRelationRecordOperation({
        onScopedRelationRecordOperation,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ScopedRelationAliasesContext.Provider value={scopedRelationAliases}>
          {children}
        </ScopedRelationAliasesContext.Provider>
      ),
    },
  );

  return onScopedRelationRecordOperation;
};

describe('useListenToScopedRelationRecordOperation', () => {
  it('reloads when a record of a scoped column object is written', () => {
    const onScopedRelationRecordOperation = renderListener([peopleAlias]);

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: personObjectMetadataItem,
      operation: { type: 'delete-one', deletedRecordId: 'person' },
    });

    expect(onScopedRelationRecordOperation).toHaveBeenCalledTimes(1);
  });

  it('ignores a record of an object no scoped column shows', () => {
    const onScopedRelationRecordOperation = renderListener([peopleAlias]);

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem: taskObjectMetadataItem,
      operation: { type: 'delete-one', deletedRecordId: 'task' },
    });

    expect(onScopedRelationRecordOperation).not.toHaveBeenCalled();
  });
});
