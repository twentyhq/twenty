import { styled } from '@linaria/react';
import { useContext } from 'react';

import { IconGripVertical, Label } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  cursor: grab;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: calc(32px - 2 * ${themeCssVariables.spacing[2]});
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
`;

const StyledIconContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[1]};
`;

type FieldsConfigurationGroupDraggableHeaderProps = {
  text: string;
};

export const FieldsConfigurationGroupDraggableHeader = ({
  text,
}: FieldsConfigurationGroupDraggableHeaderProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={themeCssVariables.font.color.tertiary}
        />
      </StyledIconContainer>
      <Label>{text}</Label>
    </StyledContainer>
  );
};
