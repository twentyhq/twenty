import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { useGetLogicFunctionHttpUrl } from '@/settings/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Info } from 'twenty-ui/feedback';
import { IconCopy } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

// Educates workspace members about the dedicated, isolated domain on which the
// application's HTTP-triggered logic functions are served (Twenty Cloud only).
export const SettingsApplicationFunctionDomainSection = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const { publicFunctionDomain, workspaceSubdomain } =
    useGetLogicFunctionHttpUrl();

  if (
    !isNonEmptyString(publicFunctionDomain) ||
    !isNonEmptyString(workspaceSubdomain)
  ) {
    return null;
  }

  const baseDomain = `${workspaceSubdomain}.${publicFunctionDomain}`;
  const baseUrl = `https://${baseDomain}`;

  return (
    <Section>
      <H2Title
        title={t`Public URL`}
        description={t`Your HTTP-triggered logic functions are served from this dedicated domain, isolated from your main workspace. Because it shares nothing with your app, functions can return any header — including custom headers, Permissions-Policy, Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy.`}
      />
      <SettingsTextInput
        instanceId="application-public-function-domain"
        label={t`Base URL`}
        value={baseUrl}
        onChange={() => {}}
        readOnly
        fullWidth
        RightIcon={IconCopy}
        onRightIconClick={() =>
          copyToClipboard(baseUrl, t`URL copied to clipboard`)
        }
      />
      <Info
        text={t`Each HTTP route is reachable at ${baseUrl}/your-route. The legacy /s/ endpoint stays available for self-hosting and existing routes.`}
      />
    </Section>
  );
};
