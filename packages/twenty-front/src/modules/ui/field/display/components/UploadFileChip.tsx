import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconArrowUp } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[5]};
  margin-right: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledIconBox = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.font.color.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.background.primary};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const StyledStaticLoader = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.font.color.tertiary};
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <StyledIconBox>
        <IconArrowUp size={theme.icon.size.sm} />
      </StyledIconBox>
      {isLoading ? <Loader /> : <StyledStaticLoader />}
    </StyledContainer>
  );
};
