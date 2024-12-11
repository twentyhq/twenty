import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const ErrorToastProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [searchParams] = useSearchParams();
  const { enqueueSnackBar } = useSnackBar();

  const errorMessage = searchParams.get('errorMessage');

  if (isDefined(errorMessage)) {
    enqueueSnackBar(errorMessage, {
      variant: SnackBarVariant.Error,
    });
  }

  return <>{children}</>;
};
