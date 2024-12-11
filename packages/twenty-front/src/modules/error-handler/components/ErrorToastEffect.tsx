import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import DOMPurify from 'dompurify';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const ErrorToastEffect = () => {
  const [searchParams] = useSearchParams();
  const { enqueueSnackBar } = useSnackBar();

  useEffect(() => {
    const errorMessage = searchParams.get('errorMessage');

    if (isDefined(errorMessage)) {
      const sanitizedMessage = DOMPurify.sanitize(errorMessage);

      enqueueSnackBar(sanitizedMessage, {
        variant: SnackBarVariant.Error,
      });
    }
  }, [enqueueSnackBar, searchParams]);

  return <></>;
};
