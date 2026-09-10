import { styled } from '@linaria/react';
import { useContext, useId } from 'react';
import { CardContent } from 'twenty-ui/surfaces';
import { type IconComponent } from 'twenty-ui/icon';
import { Radio } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRadioCardContentContainer = styled.label`
  > div {
    align-items: center;
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: ${themeCssVariables.border.radius.sm};
    cursor: pointer;
    display: flex;
    flex-grow: 1;
    gap: ${themeCssVariables.spacing[2]};
    padding: ${themeCssVariables.spacing[2]};

    &:hover {
      background: ${themeCssVariables.background.transparent.lighter};
    }
  }
`;

const StyledRadioContainer = styled.span`
  align-items: center;
  display: flex;
  margin-left: auto;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
`;

type SettingsRadioCardProps = {
  value: string;
  title: string;
  description?: string;
  Icon?: IconComponent;
};

export const SettingsRadioCard = ({
  value,
  title,
  description,
  Icon,
}: SettingsRadioCardProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const { theme } = useContext(ThemeContext);

  return (
    <StyledRadioCardContentContainer>
      <CardContent>
        {Icon && <Icon size={theme.icon.size.xl} color={theme.color.gray10} />}
        <span>
          {title && <StyledTitle id={titleId}>{title}</StyledTitle>}
          {description && (
            <StyledDescription id={descriptionId}>
              {description}
            </StyledDescription>
          )}
        </span>
        <StyledRadioContainer>
          <Radio
            value={value}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
          />
        </StyledRadioContainer>
      </CardContent>
    </StyledRadioCardContentContainer>
  );
};
