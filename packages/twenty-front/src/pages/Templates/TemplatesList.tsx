import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useSelectedTableCellEditMode } from '@/object-record/record-table/record-table-cell/hooks/useSelectedTableCellEditMode';
import { RGBA } from '@/ui/theme/constants/Rgba';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useContext } from 'react';
export const TemplatesList = () => {
  // const objectNameSingular = 'people';
  // const { updateOneRecord } = useUpdateOneRecord({
  //   objectNameSingular,
  // });

  // const updateEntity = ({ variables }: RecordUpdateHookParams) => {
  //   updateOneRecord?.({
  //     idToUpdate: variables.where.id as string,
  //     updateOneRecordInput: variables.updateOneRecordInput,
  //   });
  // };

  const { recordId } = useContext(RecordTableRowContext);

  
  const objectNamePlural = useParams().objectNamePlural ?? 'campaignLists';

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  console.log(objectNamePlural);

  const { createOneRecord: createOneObject } = useCreateOneRecord({
    objectNameSingular,
  });
  console.log(createOneObject);

  const recordIndexId = objectNamePlural ?? 'campaignLists';
  const setHotkeyScope = useSetHotkeyScope();

  const { setSelectedTableCellEditMode } = useSelectedTableCellEditMode({
    scopeId: recordIndexId,
  });

  const handleAddButtonClick = async () => {
    await createOneObject?.({
      position: 0,
    });

    setSelectedTableCellEditMode(0, 0);
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope, DEFAULT_CELL_SCOPE.customScopes);
  };

  return (
    <>
      <RecordIndexContainer
        recordIndexId={recordIndexId}
        objectNamePlural={objectNamePlural}
        createRecord={handleAddButtonClick}
      />
    </>
  );
};