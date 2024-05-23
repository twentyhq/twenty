import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { RecordIndexContainer } from '@/object-record/record-index/components/RecordIndexContainer';
import { RecordIndexPageHeader } from '@/object-record/record-index/components/RecordIndexPageHeader';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useSelectedTableCellEditMode } from '@/object-record/record-table/record-table-cell/hooks/useSelectedTableCellEditMode';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { capitalize } from '~/utils/string/capitalize';

const StyledIndexContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const RecordIndexPage = () => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const recordIndexId = objectNamePlural ?? '';
  const setHotkeyScope = useSetHotkeyScope();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { setSelectedTableCellEditMode } = useSelectedTableCellEditMode({
    scopeId: recordIndexId,
  });

  const { setPendingRecordId } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const { openRightDrawer } = useRightDrawer();
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const handleAddButtonClick = async () => {
    const pendingId = v4();
    setPendingRecordId(pendingId);

    setViewableRecordId(pendingId);
    setViewableRecordNameSingular(objectNameSingular);
    openRightDrawer(RightDrawerPages.ViewRecord);

    setSelectedTableCellEditMode(-1, 0);
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope, DEFAULT_CELL_SCOPE.customScopes);
  };

  return (
    <PageContainer>
      <PageTitle title={`${capitalize(objectNamePlural)}`} />
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
