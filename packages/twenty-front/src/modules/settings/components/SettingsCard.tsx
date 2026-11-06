import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Badge } from 'twenty-ui/primitives/data-display';
import { Card } from 'twenty-ui/primitives/surfaces';
import { type ThemeColor, useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

type SettingsCardProps = {
  description?: string;
  disabled?: boolean;
  soon?: boolean;
  Icon: ReactNode;
  iconColor?: string;
  illustrationColor?: ThemeColor;
  onClick?: () => void;
  to?: string;
  href?: string;
  title: string;
  className?: string;
  Status?: ReactNode;
};

const ILLUSTRATION_LINE_INSETS = [
  themeCssVariables.spacing[0],
  themeCssVariables.spacing[1],
  themeCssVariables.spacing[2],
];

const StyledCardWrapper = styled.div<{
  disabled?: boolean;
}>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'default')};
  width: 100%;
`;

const StyledCardContent = styled(Card.Content)`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.span<{ disabled?: boolean }>`
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.secondary};
  display: flex;
  flex: 1 0 auto;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-start;
`;

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
`;

const StyledDescription = styled.span<{ disabled?: boolean }>`
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: block;
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[7]};
`;

const StyledIllustratedCardContent = styled(Card.Content)`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledIllustratedText = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledIllustratedDescription = styled(StyledDescription)`
  padding: 0;
`;

const StyledIllustration = styled.span<{ illustrationColor: ThemeColor }>`
  border: 2px solid
    ${({ illustrationColor }) =>
      themeCssVariables.color[`${illustrationColor}6`]};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  height: 40px;
  justify-content: center;
  padding: ${themeCssVariables.spacing['0.5']};
  width: 32px;
`;

const StyledIllustrationBlock = styled.span<{ illustrationColor: ThemeColor }>`
  align-items: center;
  background-color: ${({ illustrationColor }) =>
    themeCssVariables.color[`${illustrationColor}8`]};
  border-radius: calc(
    ${themeCssVariables.border.radius.sm} - ${themeCssVariables.spacing[1]}
  );
  display: flex;
  flex: 1 0 ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing['0.5']};
  justify-content: center;
`;

const StyledIllustrationLine = styled.span<{
  illustrationColor: ThemeColor;
  inset: string;
}>`
  background-color: ${({ illustrationColor }) =>
    themeCssVariables.color[`${illustrationColor}4`]};
  border-radius: 1px;
  flex: 0 0 3px;
  margin-right: ${({ inset }) => inset};
`;

const StyledIconContainer = styled.span<{
  disabled?: boolean;
  iconColor?: string;
}>`
  align-items: center;
  color: ${({ disabled, iconColor }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : (iconColor ?? themeCssVariables.font.color.tertiary)};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

export const SettingsCard = ({
  description,
  soon,
  disabled = soon,
  Icon,
  iconColor,
  illustrationColor,
  onClick,
  to,
  href,
  title,
  className,
  Status,
}: SettingsCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const getContentOwner = () => {
    if (disabled) {
      return undefined;
    }

    if (isDefined(to)) {
      return <Link to={to} onClick={onClick} />;
    }

    if (isDefined(href)) {
      return <a href={href} target="_blank" rel="noopener noreferrer" />;
    }

    if (isDefined(onClick)) {
      return <button type="button" onClick={onClick} />;
    }

    return undefined;
  };

  const titleAndActions = (
    <>
      <StyledTitle disabled={disabled}>
        {title}
        {soon && <Badge>{t`Soon`}</Badge>}
      </StyledTitle>
      {isDefined(Status) && Status}
      <StyledIconChevronRightContainer>
        <IconChevronRight size={theme.icon.size.sm} />
      </StyledIconChevronRightContainer>
    </>
  );

  return (
    <StyledCardWrapper disabled={disabled} className={className}>
      <Card.Root fullWidth>
        {isDefined(illustrationColor) ? (
          <StyledIllustratedCardContent render={getContentOwner()}>
            <StyledIllustration
              illustrationColor={illustrationColor}
              aria-hidden
            >
              <StyledIllustrationBlock illustrationColor={illustrationColor}>
                {Icon}
              </StyledIllustrationBlock>
              {ILLUSTRATION_LINE_INSETS.map((inset) => (
                <StyledIllustrationLine
                  key={inset}
                  illustrationColor={illustrationColor}
                  inset={inset}
                />
              ))}
            </StyledIllustration>
            <StyledIllustratedText>
              <StyledHeader>{titleAndActions}</StyledHeader>
              {isNonEmptyString(description) && (
                <StyledIllustratedDescription disabled={disabled}>
                  {description}
                </StyledIllustratedDescription>
              )}
            </StyledIllustratedText>
          </StyledIllustratedCardContent>
        ) : (
          <StyledCardContent render={getContentOwner()}>
            <StyledHeader>
              <StyledIconContainer disabled={disabled} iconColor={iconColor}>
                {Icon}
              </StyledIconContainer>
              {titleAndActions}
            </StyledHeader>
            {isNonEmptyString(description) && (
              <StyledDescription disabled={disabled}>
                {description}
              </StyledDescription>
            )}
          </StyledCardContent>
        )}
      </Card.Root>
    </StyledCardWrapper>
  );
};
