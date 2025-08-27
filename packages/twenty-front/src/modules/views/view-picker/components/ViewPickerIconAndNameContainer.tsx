import styled from '@emotion/styled';

const StyledIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(1)};
`;

export { StyledIconAndNameContainer as ViewPickerIconAndNameContainer };
