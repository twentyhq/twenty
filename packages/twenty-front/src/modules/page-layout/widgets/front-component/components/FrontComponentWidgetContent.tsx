import { useState } from 'react';
import { FrontComponentContent } from 'twenty-shared/front-component';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { isFrontComponentInitializedComponentState } from '@/page-layout/widgets/front-component/states/isFrontComponentInitializedComponentState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const FrontComponentWidgetContent = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [hasError, setHasError] = useState(false);
  const isFrontComponentInitialized = useRecoilComponentValue(
    isFrontComponentInitializedComponentState,
  );

  const handleError = (error?: Error) => {
    if (isDefined(error)) {
      const errorMessage = error.message;

      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${errorMessage}`,
      });
    }
    setHasError(true);
  };

  if (hasError) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return (
    <FrontComponentContent
      isInitialized={isFrontComponentInitialized}
      componentUrl={'../mock/mock-front-component.ts'}
      onError={handleError}
    />
  );
};
