import { CARD_ACTION_CLASS_NAME } from '@/ui/layout/card/styles/CardActionClassName';
import { styled } from '@linaria/react';

import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Pill } from 'twenty-ui/primitives/data-display';
import { Card } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

type SettingsCardProps = {
  description?: string;
  disabled?: boolean;
  soon?: boolean;
  Icon: ReactNode;
  iconColor?: string;
  onClick?: () => void;
  title: string;
  className?: string;
  Status?: ReactNode;
};

const StyledCardWrapper = styled.div<{
  disabled?: boolean;
}>`
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'default')};
  width: 100%;

  > div {
    color: inherit;
  }
`;

const StyledCardContentContainer = styled.div`
  > div {
    display: flex;
    flex-direction: column;
    gap: ${themeCssVariables.spacing[2]};
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
    position: relative;
  }

  a:hover & > div,
  > div:has(> button:not(:disabled):hover) {
    background-color: ${themeCssVariables.background.quaternary};
    cursor: pointer;
  }
`;

const StyledCardAction = styled.button`
  &:disabled {
    cursor: not-allowed;
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div<{ disabled?: boolean }>`
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

const StyledDescription = styled.div`
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[7]};
`;

const StyledIconContainer = styled.div<{
  disabled?: boolean;
  iconColor?: string;
}>`
  align-items: center;
  color: ${({ disabled, iconColor }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : (iconColor ?? 'inherit')};
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
  onClick,
  title,
  className,
  Status,
}: SettingsCardProps) => {
  const theme = useTheme();

  return (
    <StyledCardWrapper disabled={disabled} className={className}>
      <Card.Root rounded={true} fullWidth>
        <StyledCardContentContainer>
          <Card.Content>
            {isDefined(onClick) && (
              <StyledCardAction
                className={CARD_ACTION_CLASS_NAME}
                type="button"
                aria-label={title}
                onClick={onClick}
                disabled={disabled}
              />
            )}
            <StyledHeader>
              <StyledIconContainer disabled={disabled} iconColor={iconColor}>
                {Icon}
              </StyledIconContainer>
              <StyledTitle disabled={disabled}>
                {title}
                {soon && <Pill label={t`Soon`} />}
              </StyledTitle>
              {isDefined(Status) && Status}
              <StyledIconChevronRightContainer>
                <IconChevronRight size={theme.icon.size.sm} />
              </StyledIconChevronRightContainer>
            </StyledHeader>
            {description && (
              <StyledDescription>{description}</StyledDescription>
            )}
          </Card.Content>
        </StyledCardContentContainer>
      </Card.Root>
    </StyledCardWrapper>
  );
};
