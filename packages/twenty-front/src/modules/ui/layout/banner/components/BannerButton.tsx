import styled from '@emotion/styled';

const StyledBannerButton = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.font.color.inverted};
  box-sizing: border-box;
`;

export { StyledBannerButton as BannerButton };
