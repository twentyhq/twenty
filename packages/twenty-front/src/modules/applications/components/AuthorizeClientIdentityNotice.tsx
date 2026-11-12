import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { IconAlertTriangle, IconCircleCheck } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledVerifiedNotice = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledVerifiedIcon = styled.span`
  color: ${themeCssVariables.color.green};
  display: flex;
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
        <StyledVerifiedIcon>
          <IconCircleCheck aria-hidden="true" size={theme.icon.size.sm} />
        </StyledVerifiedIcon>
        <Text size="sm" color="secondary">
          <Trans>
            Registered with Twenty as the official {appName}. Only continue if
            you started this connection from {appName}.
          </Trans>
        </Text>
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
