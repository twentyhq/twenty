import styled from '@emotion/styled';

import { RecordIndexOptionsDropdown } from '@/object-record/record-index/options/components/RecordIndexOptionsDropdown';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { SignInBackgroundMockContainerEffect } from '@/sign-in-background-mock/components/SignInBackgroundMockContainerEffect';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewType } from '@/views/types/ViewType';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const SignInBackgroundMockContainer = () => {
  const objectNamePlural = 'companies';
  const objectNameSingular = 'company';
  const recordIndexId = 'sign-up-mock-record-table-id';
  const viewBarId = 'companies-mock';

  return (
    <StyledContainer>
      <ViewBar
        viewBarId={viewBarId}
        onCurrentViewChange={async () => {}}
        optionsDropdownButton={
          <RecordIndexOptionsDropdown
            recordIndexId={recordIndexId}
            objectNameSingular={objectNameSingular}
            viewType={ViewType.Table}
          />
        }
        optionsDropdownScopeId={RECORD_INDEX_OPTIONS_DROPDOWN_ID}
      />
      <SignInBackgroundMockContainerEffect
        objectNamePlural={objectNamePlural}
        recordTableId={recordIndexId}
        viewId={viewBarId}
      />
      <RecordTableWithWrappers
        objectNameSingular={objectNameSingular}
        recordTableId={recordIndexId}
        viewBarId={viewBarId}
        createRecord={async () => {}}
        updateRecordMutation={() => {}}
      />
    </StyledContainer>
  );
};
