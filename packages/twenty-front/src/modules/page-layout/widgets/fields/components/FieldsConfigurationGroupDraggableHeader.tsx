import { styled } from '@linaria/react';

import { IconGripVertical } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  /* Height below is sized against the content box. */
  box-sizing: content-box;
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
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={themeCssVariables.font.color.tertiary}
        />
      </StyledIconContainer>
      <StyledDisplayLabel>{text}</StyledDisplayLabel>
    </StyledContainer>
  );
};

const StyledDisplayLabel = styled(Text)`
  color: var(--t-font-color-light);
  font-size: 11px;
  font-weight: var(--t-font-weight-semi-bold);
`;
