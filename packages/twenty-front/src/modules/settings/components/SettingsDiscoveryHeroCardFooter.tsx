import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContent = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 2px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  min-width: ${themeCssVariables.spacing[8]};
  width: ${themeCssVariables.spacing[8]};
`;

const StyledIcon = styled.div`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  transform: rotate(-4deg);
`;

const StyledTextContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-width: 0;
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  min-height: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  overflow: hidden;
  text-box-edge: cap alphabetic;
  text-box-trim: trim-both;
`;

const StyledActionContainer = styled.div`
  flex-shrink: 0;
  margin-left: auto;
`;

type SettingsDiscoveryHeroCardFooterProps = {
  Icon: IconComponent;
  title: ReactNode;
  description?: string;
  action?: ReactNode;
};

export const SettingsDiscoveryHeroCardFooter = ({
  Icon,
  title,
  description,
  action,
}: SettingsDiscoveryHeroCardFooterProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContent>
      <StyledIconContainer>
        <StyledIcon>
          <Icon
            size={theme.icon.size.lg}
            color={theme.IllustrationIcon.color.gray}
            stroke={theme.icon.stroke.md}
          />
        </StyledIcon>
      </StyledIconContainer>
      <StyledTextContainer>
        <StyledTitle>{title}</StyledTitle>
        {description && (
          <StyledDescription>
            <OverflowingTextWithTooltip text={description} />
          </StyledDescription>
        )}
      </StyledTextContainer>
      {isDefined(action) && (
        <StyledActionContainer>{action}</StyledActionContainer>
      )}
    </StyledContent>
  );
};
