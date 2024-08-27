import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

// FIXME: copy-pasted
const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  height: 100%;
`;

export const TAB_LIST_COMPONENT_ID = 'workflow-page-right-tab-list';

export const RightDrawerWorkflowEditStep = () => {
  const showPageWorkflowSelectedNode = useRecoilValue(
    showPageWorkflowSelectedNodeState,
  );

  return (
    <StyledShowPageRightContainer>
      <p>{showPageWorkflowSelectedNode}</p>
    </StyledShowPageRightContainer>
  );
};
