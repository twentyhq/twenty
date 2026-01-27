import { useState } from 'react';
import { FrontComponentContent } from 'twenty-shared/front-component';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentWidgetContentProps = {
  frontComponentId: string;
};

export const FrontComponentWidgetContent = ({
  frontComponentId: _frontComponentId,
}: FrontComponentWidgetContentProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [hasError, setHasError] = useState(false);

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
      componentUrl={'../mock/mock-front-component.ts'}
      onError={handleError}
    />
  );
};
