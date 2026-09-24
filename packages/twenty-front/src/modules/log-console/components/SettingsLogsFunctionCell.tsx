import { styled } from '@linaria/react';
import { IconBrandTypescript } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledFunction = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledFunctionName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsLogsFunctionCellProps = {
  name: string;
};

export const SettingsLogsFunctionCell = ({
  name,
}: SettingsLogsFunctionCellProps) => {
  const theme = useTheme();

  return (
    <StyledFunction>
      <IconBrandTypescript
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
        color={theme.font.color.tertiary}
      />
      <StyledFunctionName>{name}</StyledFunctionName>
    </StyledFunction>
  );
};
