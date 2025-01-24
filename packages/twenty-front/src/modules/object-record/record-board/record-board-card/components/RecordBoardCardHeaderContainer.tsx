import styled from '@emotion/styled';

const StyledBoardCardHeader = styled.div<{
  showCompactView: boolean;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 24px;
  padding-bottom: ${({ theme, showCompactView }) =>
    theme.spacing(showCompactView ? 2 : 1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  transition: padding ease-in-out 160ms;

  img {
    height: ${({ theme }) => theme.icon.size.md}px;
    object-fit: cover;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

export { StyledBoardCardHeader as RecordBoardCardHeaderContainer };
