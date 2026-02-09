import { currentUserState } from '@/auth/states/currentUserState';
import { getMockFrontComponentUrl } from '@/front-components/utils/mockFrontComponent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { FrontComponentRenderer as SharedFrontComponentRenderer } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentRendererProps = {
  frontComponentId: string;
};

export const FrontComponentRenderer = ({
  frontComponentId: _frontComponentId,
}: FrontComponentRendererProps) => {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  const { enqueueErrorSnackBar } = useSnackBar();
  const currentUser = useRecoilValue(currentUserState);

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
    return null;
  }

  return (
    <SharedFrontComponentRenderer
      theme={theme}
      componentUrl={getMockFrontComponentUrl()}
      executionContext={{
        userId: currentUser?.id,
      }}
      onError={handleError}
    />
  );
};
