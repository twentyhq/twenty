import { styled } from '@linaria/react';
import { getUrlHostnameOrThrow, isValidUrl } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledLinkTrigger = styled.span`
  display: inline-flex;
  min-width: 0;
`;

type LogConsoleWebhookEndpointLinkProps = {
  url: string;
};

export const LogConsoleWebhookEndpointLink = ({
  url,
}: LogConsoleWebhookEndpointLinkProps) => (
  <Tooltip content={url} delay={TooltipDelay.mediumDelay}>
    <StyledLinkTrigger>
      <LinkDisplay
        value={{
          url,
          label: isValidUrl(url) ? getUrlHostnameOrThrow(url) : url,
        }}
      />
    </StyledLinkTrigger>
  </Tooltip>
);
