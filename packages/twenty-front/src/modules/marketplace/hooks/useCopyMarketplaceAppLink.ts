import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const useCopyMarketplaceAppLink = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const copyMarketplaceAppLink = (universalIdentifier: string) =>
    copyToClipboard(
      `${window.location.origin}${getSettingsPath(
        SettingsPath.AvailableApplicationDetail,
        { availableApplicationId: universalIdentifier },
      )}`,
      t`Link copied to clipboard`,
    );

  return { copyMarketplaceAppLink };
};
