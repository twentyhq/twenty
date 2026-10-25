import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { IconCalendarX } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledSeparator = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${themeCssVariables.spacing[8]};
  margin: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  width: auto;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledButtonContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: start;
`;

type DatePickerClearButtonProps = {
  onClear?: () => void;
};

export const DatePickerClearButton = ({
  onClear,
}: DatePickerClearButtonProps) => {
  const theme = useTheme();

  return (
    <>
      <StyledSeparator />
      <StyledButtonContainer onClick={() => onClear?.()}>
        <StyledButtonContent>
          <IconCalendarX size={theme.icon.size.md} />
          <Text>{t`Clear`}</Text>
        </StyledButtonContent>
      </StyledButtonContainer>
    </>
  );
};
