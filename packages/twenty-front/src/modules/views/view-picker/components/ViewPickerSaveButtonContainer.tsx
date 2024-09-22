import styled from '@emotion/styled';

const StyledSaveButtonContainer = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
`;

export { StyledSaveButtonContainer as ViewPickerSaveButtonContainer };
