import styled from '@emotion/styled';

const StyledContainer = styled.div<{ shouldDisplay: boolean }>`
  position: relative;
  visibility: ${({ shouldDisplay }) => (shouldDisplay ? 'visible' : 'hidden')};
`;

export { StyledContainer as WorkflowDiagramEdgeV2VisibilityContainer };
