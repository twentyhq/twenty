import { styled } from '@linaria/react';

import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';
import { Card, CardContent } from 'twenty-ui/layout';
import { IconChevronRight } from 'twenty-ui/display';
import { Pill } from 'twenty-ui/components';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsCardProps = {
  description?: string;
  disabled?: boolean;
  soon?: boolean;
  Icon: ReactNode;
  onClick?: () => void;
  title: string;
  className?: string;
  Status?: ReactNode;
};

const StyledCardWrapper = styled.div<{
  disabled?: boolean;
  clickable?: boolean;
}>`
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  cursor: ${({ disabled, clickable }) =>
    disabled ? 'not-allowed' : clickable ? 'pointer' : 'default'};
  width: 100%;

  > * {
    color: inherit;
  }
`;

const StyledCardContentContainer = styled.div`
  > * {
    display: flex;
    flex-direction: column;
    gap: ${themeCssVariables.spacing[2]};
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};

    &:hover {
      background-color: ${themeCssVariables.background.quaternary};
      cursor: pointer;
    }
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
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[7]};
`;

const StyledIconContainer = styled.div`
  align-items: center;
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
  onClick,
  title,
  className,
  Status,
}: SettingsCardProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledCardWrapper
      disabled={disabled}
      clickable={!!onClick}
      className={className}
    >
      <Card onClick={disabled ? undefined : onClick} rounded={true} fullWidth>
        <StyledCardContentContainer>
          <CardContent>
            <StyledHeader>
              <StyledIconContainer>{Icon}</StyledIconContainer>
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
          </CardContent>
        </StyledCardContentContainer>
      </Card>
    </StyledCardWrapper>
  );
};
