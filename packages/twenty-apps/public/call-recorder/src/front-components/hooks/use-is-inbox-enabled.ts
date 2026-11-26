import { useEffect, useState } from 'react';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';

import { isInboxEnabled } from 'src/logic-functions/data/is-inbox-enabled.util';

export const useIsInboxEnabled = (): boolean => {
  const { t } = useTranslate();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    isInboxEnabled({ metadataClient: new MetadataApiClient() })
      .then(setIsEnabled)
      .catch(() =>
        enqueueSnackbar({
          message: t('Could not load the inbox settings.'),
          variant: 'error',
        }),
      );
  }, [t]);

  return isEnabled;
};
