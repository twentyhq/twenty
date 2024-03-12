import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useSelectedTableCellEditMode } from '@/object-record/record-table/record-table-cell/hooks/useSelectedTableCellEditMode';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { RecordIndexPageHeader } from '~/pages/object-record/RecordIndexPageHeader';

const StyledIndexContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const RecordIndexPage = () => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { createOneRecord: createOneObject } = useCreateOneRecord({
    objectNameSingular,
  });

  const recordIndexId = objectNamePlural ?? '';
  const setHotkeyScope = useSetHotkeyScope();

  const { setSelectedTableCellEditMode } = useSelectedTableCellEditMode({
    scopeId: recordIndexId,
  });

  const handleAddButtonClick = async () => {
    await createOneObject?.({
      position: 'first',
    });

    setSelectedTableCellEditMode(0, 0);
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope, DEFAULT_CELL_SCOPE.customScopes);
  };

  return (
    <PageContainer>
      <RecordIndexPageHeader createRecord={handleAddButtonClick} />
      <PageBody>
        <StyledIndexContainer>
          <RecordIndexContainer
            recordIndexId={recordIndexId}
            objectNamePlural={objectNamePlural}
            createRecord={handleAddButtonClick}
          />
        </StyledIndexContainer>
      </PageBody>
    </PageContainer>
  );
};
