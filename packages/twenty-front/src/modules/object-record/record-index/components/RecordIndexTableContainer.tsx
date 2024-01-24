import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { RecordUpdateHookParams } from '@/object-record/field/contexts/FieldContext';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordTableEffect } from '@/object-record/record-index/components/RecordTableEffect';
import { RecordTableActionBar } from '@/object-record/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { RecordTableContextMenu } from '@/object-record/record-table/context-menu/components/RecordTableContextMenu';

type RecordIndexTableContainerProps = {
  recordTableId: string;
  viewBarId: string;
  objectNamePlural: string;
  createRecord: () => Promise<void>;
};

export const RecordIndexTableContainer = ({
  recordTableId,
  viewBarId,
  objectNamePlural,
  createRecord,
}: RecordIndexTableContainerProps) => {
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular,
  });

  const updateEntity = ({ variables }: RecordUpdateHookParams) => {
    updateOneRecord?.({
      idToUpdate: variables.where.id as string,
      updateOneRecordInput: variables.updateOneRecordInput,
    });
  };

  return (
    <>
      <RecordTableEffect
        objectNamePlural={objectNamePlural}
        recordTableId={recordTableId}
        viewBarId={viewBarId}
      />
      <RecordTableWithWrappers
        recordTableId={recordTableId}
        objectNamePlural={objectNamePlural}
        viewBarId={viewBarId}
        updateRecordMutation={updateEntity}
        createRecord={createRecord}
      />
      <RecordTableActionBar recordTableId={recordTableId} />
      <RecordTableContextMenu recordTableId={recordTableId} />
    </>
  );
};
