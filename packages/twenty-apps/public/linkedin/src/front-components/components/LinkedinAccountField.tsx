import styled from '@emotion/styled';
import { useId } from 'react';
import { t } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconBrandLinkedin } from 'twenty-ui/icon';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  border-bottom: 1px solid ${() => themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding-bottom: ${() => themeCssVariables.spacing[6]};
`;

const StyledLabel = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.xs};
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

// Read-only on purpose: a member has a single LinkedIn connection
const StyledValue = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.font.color.primary};
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  height: ${() => themeCssVariables.spacing[8]};
  min-width: 0;
  padding: 0 ${() => themeCssVariables.spacing[2]};
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHandle = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
`;

type LinkedinAccountFieldProps = {
  name: string;
  handle: string;
  isAuthFailed: boolean;
};

export const LinkedinAccountField = ({
  name,
  handle,
  isAuthFailed,
}: LinkedinAccountFieldProps) => {
  const labelId = useId();

  return (
    <StyledContainer>
      <StyledLabel id={labelId}>{t('Account')}</StyledLabel>
      <StyledValue aria-labelledby={labelId}>
        <IconBrandLinkedin
          size={THEME_COMMON.icon.size.md}
          stroke={THEME_COMMON.icon.stroke.md}
        />
        <StyledText>
          {name} <StyledHandle>· {handle}</StyledHandle>
        </StyledText>
      </StyledValue>
      {isAuthFailed && (
        <InlineBanner layout="compact" status="warning">
          {t(
            'LinkedIn signed you out. Reconnect your account to keep syncing.',
          )}
        </InlineBanner>
      )}
    </StyledContainer>
  );
};
