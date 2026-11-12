import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { IconAlertTriangle, IconCircleCheck } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledVerifiedNotice = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledVerifiedLine = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledVerifiedIcon = styled.span`
  color: ${themeCssVariables.color.green};
  display: flex;
`;

// Wraps inside the card without widening it: the card sizes itself to its content.
const StyledReminder = styled.div`
  min-width: 100%;
  width: 0;
`;

const StyledWarningContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

type AuthorizeClientIdentityNoticeProps = {
  appName: string;
  isVerified: boolean;
  isClaimingVerifiedClientName: boolean;
};

export const AuthorizeClientIdentityNotice = ({
  appName,
  isVerified,
  isClaimingVerifiedClientName,
}: AuthorizeClientIdentityNoticeProps) => {
  const theme = useTheme();

  if (isVerified) {
    return (
      <StyledVerifiedNotice>
        <StyledVerifiedLine>
          <StyledVerifiedIcon>
            <IconCircleCheck aria-hidden="true" size={theme.icon.size.sm} />
          </StyledVerifiedIcon>
          <Text size="sm" color="secondary">
            <Trans>Registered with Twenty as the official {appName}</Trans>
          </Text>
        </StyledVerifiedLine>
        <StyledReminder>
          <Text size="sm" color="tertiary">
            <Trans>
              Only continue if you started this connection from {appName}.
            </Trans>
          </Text>
        </StyledReminder>
      </StyledVerifiedNotice>
    );
  }

  if (!isClaimingVerifiedClientName) {
    return null;
  }

  return (
    <StyledWarningContainer>
      <InlineBanner
        status="warning"
        icon={<IconAlertTriangle aria-hidden="true" />}
      >
        <Trans>
          This app calls itself {appName}, but Twenty could not confirm it is.
          Only continue if you started this connection from {appName}.
        </Trans>
      </InlineBanner>
    </StyledWarningContainer>
  );
};
