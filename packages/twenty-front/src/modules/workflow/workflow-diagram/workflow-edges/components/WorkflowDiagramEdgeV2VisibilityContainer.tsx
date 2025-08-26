import styled from '@emotion/styled';

const StyledContainer = styled.div<{ shouldDisplay: boolean }>`
  opacity: ${({ shouldDisplay }) => (shouldDisplay ? 1 : 0)};
  position: relative;
`;

export { StyledContainer as WorkflowDiagramEdgeV2VisibilityContainer };
