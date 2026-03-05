import { styled } from '@linaria/react';

import { type ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import { Card, CardContent } from 'twenty-ui/layout';
import { IconChevronRight } from 'twenty-ui/display';
import { Pill } from 'twenty-ui/components';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

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

const StyledCardContainer = styled.div<{
  isDisabled?: boolean;
  hasOnClick?: boolean;
}>`
  width: 100%;

  > div {
    color: ${({ isDisabled }) =>
      isDisabled
        ? themeCssVariables.font.color.extraLight
        : themeCssVariables.font.color.tertiary};
    cursor: ${({ isDisabled, hasOnClick }) =>
      isDisabled ? 'not-allowed' : hasOnClick ? 'pointer' : 'default'};
  }
`;

const StyledCardContentContainer = styled.div`
  > div {
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
  color: ${themeCssVariables.font.color.light};
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
  return (
    <StyledCardContainer
      isDisabled={disabled}
      hasOnClick={!!onClick}
      className={className}
    >
      <Card onClick={disabled ? undefined : onClick} rounded={true}>
        <StyledCardContentContainer>
          <CardContent>
            <StyledHeader>
              <StyledIconContainer>{Icon}</StyledIconContainer>
              <StyledTitle disabled={disabled}>
                {title}
                {soon && <Pill label={t`Soon`} />}
              </StyledTitle>
              {Status && Status}
              <StyledIconChevronRightContainer>
                <IconChevronRight
                  size={resolveThemeVariableAsNumber(
                    themeCssVariables.icon.size.sm,
                  )}
                />
              </StyledIconChevronRightContainer>
            </StyledHeader>
            {description && (
              <StyledDescription>{description}</StyledDescription>
            )}
          </CardContent>
        </StyledCardContentContainer>
      </Card>
    </StyledCardContainer>
  );
};
