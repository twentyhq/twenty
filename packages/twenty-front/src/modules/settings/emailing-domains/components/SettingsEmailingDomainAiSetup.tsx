import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconX } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

import ClaudeLogo from '@/settings/mcp-and-apis/assets/mcp-clients/claude-color.png';
import CursorLogo from '@/settings/mcp-and-apis/assets/mcp-clients/cursor.svg';
import GeminiCliLogo from '@/settings/mcp-and-apis/assets/mcp-clients/gemini-cli.svg';
import OpenAiLogo from '@/settings/mcp-and-apis/assets/mcp-clients/openai.svg';
import { McpClientLogo } from '@/settings/mcp-and-apis/components/McpClientLogo';
import { buildEmailingDomainAiSetupPrompt } from '@/settings/emailing-domains/utils/buildEmailingDomainAiSetupPrompt';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type SettingsEmailingDomainAiSetupProps = {
  domain: string;
  records: {
    type: string;
    key: string;
    value: string;
    priority?: number | null;
  }[];
};

const StyledContainer = styled.div`
  align-items: center;
  align-self: flex-end;
  display: inline-flex;
  max-width: 100%;
  position: relative;
`;

const StyledPromptButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[7]};
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[2]};
  transition: background ${themeCssVariables.animation.duration.normal}s ease;

  &:hover,
  &:focus-visible {
    background: ${themeCssVariables.background.transparent.light};
    border-color: ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.primary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.border.color.blue};
    outline-offset: 2px;
  }
`;

const StyledButtonLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLogos = styled.span`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLogo = styled.span`
  display: block;
  height: ${themeCssVariables.spacing[4]};
  width: ${themeCssVariables.spacing[4]};
`;

const StyledDismissButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: ${themeCssVariables.border.radius.rounded};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  inset-inline-end: calc(-1 * ${themeCssVariables.spacing[7]});
  justify-content: center;
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity ${themeCssVariables.animation.duration.normal}s ease;
  visibility: hidden;
  width: ${themeCssVariables.spacing[6]};

  ${StyledContainer}:hover &,
  ${StyledContainer}:focus-within & {
    opacity: 1;
    visibility: visible;
  }

  @media (hover: none) {
    opacity: 1;
    visibility: visible;
  }

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

export const SettingsEmailingDomainAiSetup = ({
  domain,
  records,
}: SettingsEmailingDomainAiSetupProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleCopy = () => {
    copyToClipboard(buildEmailingDomainAiSetupPrompt({ domain, records }));
  };

  return (
    <StyledContainer>
      <Tooltip
        content={t`Copies a Cloudflare setup prompt for your AI coding tool`}
        maxWidth="440px"
      >
        <StyledPromptButton type="button" onClick={handleCopy}>
          <StyledButtonLabel>{t`Set up DNS with AI`}</StyledButtonLabel>
          <StyledLogos aria-hidden="true">
            <StyledLogo>
              <McpClientLogo src={ClaudeLogo} />
            </StyledLogo>
            <StyledLogo>
              <McpClientLogo src={OpenAiLogo} invertInDarkMode />
            </StyledLogo>
            <StyledLogo>
              <McpClientLogo src={CursorLogo} invertInDarkMode />
            </StyledLogo>
            <StyledLogo>
              <McpClientLogo src={GeminiCliLogo} />
            </StyledLogo>
          </StyledLogos>
        </StyledPromptButton>
      </Tooltip>
      <StyledDismissButton
        type="button"
        aria-label={t`Dismiss AI setup prompt`}
        onClick={() => setIsDismissed(true)}
      >
        <IconX size={theme.icon.size.sm} />
      </StyledDismissButton>
    </StyledContainer>
  );
};
