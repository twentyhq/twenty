import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const useCopyMarketplaceAppLink = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();

  const copyMarketplaceAppLink = (universalIdentifier: string) => {
    const url = new URL(window.location.origin);

    url.hostname = defaultDomain;
    url.pathname = getSettingsPath(SettingsPath.AvailableApplicationDetail, {
      availableApplicationId: universalIdentifier,
    });

    copyToClipboard(url.toString(), t`Link copied to clipboard`);
  };

  return { copyMarketplaceAppLink };
};
