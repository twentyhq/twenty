import { isBuiltInMcpClientAppName } from '@/applications/utils/isBuiltInMcpClientAppName';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle, IconCircleCheck } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { type WellKnownOAuthClient } from '~/generated-metadata/graphql';

const StyledVerifiedNotice = styled.p`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin: 0;
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
  wellKnownOAuthClient?: WellKnownOAuthClient | null;
};

export const AuthorizeClientIdentityNotice = ({
  appName,
  wellKnownOAuthClient,
}: AuthorizeClientIdentityNoticeProps) => {
  const theme = useTheme();

  if (isDefined(wellKnownOAuthClient)) {
    return (
      <StyledVerifiedNotice>
        <StyledVerifiedIcon>
          <IconCircleCheck size={theme.icon.size.sm} />
        </StyledVerifiedIcon>
        <Trans>Verified by Twenty as the official {appName}</Trans>
      </StyledVerifiedNotice>
    );
  }

  if (!isBuiltInMcpClientAppName(appName)) {
    return null;
  }

  return (
    <StyledWarningContainer>
      {/* A plain string child is cut to one line, and this warning must be read in full */}
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
