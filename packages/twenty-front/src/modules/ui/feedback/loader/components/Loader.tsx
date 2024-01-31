import styled from '@emotion/styled';

const StyledLoaderContainer = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
`;

export const Loader = () => <StyledLoaderContainer></StyledLoaderContainer>;
