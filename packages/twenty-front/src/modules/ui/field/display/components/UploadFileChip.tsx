import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconArrowUp } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(5)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconBox = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.font.color.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.background.primary};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const StyledStaticLoader = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.font.color.tertiary};
  border-radius: 12px;
  box-sizing: border-box;
  display: flex;
  height: 12px;
  justify-content: center;
  width: 24px;
`;

type UploadFileChipProps = {
  isLoading?: boolean;
};

export const UploadFileChip = ({ isLoading = true }: UploadFileChipProps) => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledIconBox>
        <IconArrowUp size={theme.icon.size.sm} />
      </StyledIconBox>
      {isLoading ? <Loader /> : <StyledStaticLoader />}
    </StyledContainer>
  );
};
