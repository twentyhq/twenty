import { useState } from 'react';
import { FrontComponentContent } from 'twenty-shared/front-component';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { getFrontComponentUrl } from '@/page-layout/widgets/front-component/utils/getFrontComponentUrl';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentWidgetContentProps = {
  frontComponentId: string;
};

export const FrontComponentWidgetContent = ({
  frontComponentId,
}: FrontComponentWidgetContentProps) => {
  const [hasError, setHasError] = useState(false);

  const { enqueueErrorSnackBar } = useSnackBar();

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
      componentUrl={getFrontComponentUrl(frontComponentId)}
      onError={handleError}
    />
  );
};
