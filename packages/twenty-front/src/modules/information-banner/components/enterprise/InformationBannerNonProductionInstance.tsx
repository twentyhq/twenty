import { enterpriseInstanceTypeState } from '@/client-config/states/enterpriseInstanceTypeState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { ENTERPRISE_INSTANCE_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const InformationBannerNonProductionInstance = () => {
  const enterpriseInstanceType = useAtomStateValue(enterpriseInstanceTypeState);

  if (
    !isDefined(enterpriseInstanceType) ||
    enterpriseInstanceType === ENTERPRISE_INSTANCE_TYPE.PRODUCTION
  ) {
    return null;
  }

  return (
    <InformationBanner
      componentInstanceId="information-banner-non-production-instance"
      variant="secondary"
      message={t`This is a non-production instance.`}
    />
  );
};
