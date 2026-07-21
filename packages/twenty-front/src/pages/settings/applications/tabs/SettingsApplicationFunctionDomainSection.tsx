import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { SettingsPublicDomainsListCard } from '@/settings/domains/components/SettingsPublicDomainsListCard';
import { useGetLogicFunctionHttpUrl } from '@/settings/logic-functions/hooks/useGetLogicFunctionHttpUrl';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { IconCopy } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationFunctionDomainSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const { functionsBaseUrl } = useGetLogicFunctionHttpUrl();

  return (
    <Section>
      <H2Title
        title={t`App URL`}
        description={t`This app's routes are served from this URL. Add a custom domain to use your own.`}
      />
      <StyledContent>
        <SettingsTextInput
          instanceId="application-public-function-domain"
          value={functionsBaseUrl}
          onChange={() => {}}
          readOnly
          fullWidth
          RightIcon={IconCopy}
          onRightIconClick={() =>
            copyToClipboard(functionsBaseUrl, t`URL copied to clipboard`)
          }
        />
        <SettingsPublicDomainsListCard applicationId={applicationId} />
      </StyledContent>
    </Section>
  );
};
