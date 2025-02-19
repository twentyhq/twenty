import styled from '@emotion/styled';

const StyledStepListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

export { StyledStepListContainer as RightDrawerStepListContainer };
