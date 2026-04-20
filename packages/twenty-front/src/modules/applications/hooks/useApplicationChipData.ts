import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { useApplicationsByIdMap } from '@/applications/hooks/useApplicationsByIdMap';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseApplicationChipDataArgs = {
  applicationId: string;
};

type ApplicationChipData = {
  name: string;
  seed: string;
};

type UseApplicationChipDataReturnType = {
  applicationChipData: ApplicationChipData;
};

export const useApplicationChipData = ({
  applicationId,
}: UseApplicationChipDataArgs): UseApplicationChipDataReturnType => {
  const applicationsById = useApplicationsByIdMap();
  const currentApplicationId = useContext(CurrentApplicationContext);

  const application = applicationsById.get(applicationId);

  const isCurrent =
    isDefined(currentApplicationId) && currentApplicationId === applicationId;

  return {
    applicationChipData: {
      name: isCurrent ? t`This app` : (application?.name ?? ''),
      seed: application?.universalIdentifier ?? application?.name ?? applicationId,
    },
  };
};
