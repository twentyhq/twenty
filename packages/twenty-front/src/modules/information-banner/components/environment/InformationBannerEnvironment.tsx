import { REACT_APP_ENVIRONMENT_LABEL } from '~/config';

import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

export const InformationBannerEnvironment = () => {
  if (!isNonEmptyString(REACT_APP_ENVIRONMENT_LABEL)) {
    return null;
  }

  return (
    <InformationBanner
      componentInstanceId="information-banner-environment"
      message={t`Environment: ${REACT_APP_ENVIRONMENT_LABEL}`}
      color="danger"
    />
  );
};
