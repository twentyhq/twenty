import { enterpriseInstanceTypeState } from '@/client-config/states/enterpriseInstanceTypeState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ENTERPRISE_INSTANCE_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

export const InformationBannerNonProductionInstance = () => {
  const { t } = useLingui();
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
      variant="soft"
      message={t`This is a non-production instance.`}
    />
  );
};
