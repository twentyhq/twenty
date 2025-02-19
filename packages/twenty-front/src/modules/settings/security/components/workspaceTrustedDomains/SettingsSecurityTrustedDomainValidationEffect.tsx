import { useEffect } from 'react';
import { isDefined } from 'twenty-shared';
import { useValidateWorkspaceTrustedDomainMutation } from '~/generated/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSearchParams } from 'react-router-dom';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

export const SettingsSecurityTrustedDomainValidationEffect = () => {
  const [validateWorkspaceTrustedDomainMutation] =
    useValidateWorkspaceTrustedDomainMutation();
  const { enqueueSnackBar } = useSnackBar();
  const [searchParams] = useSearchParams();
  const workspaceTrustedDomainId = searchParams.get('wtdId');
  const validationToken = searchParams.get('validationToken');

  useEffect(() => {
    if (isDefined(validationToken) && isDefined(workspaceTrustedDomainId)) {
      validateWorkspaceTrustedDomainMutation({
        variables: {
          input: {
            validationToken,
            workspaceTrustedDomainId,
          },
        },
        onCompleted: () => {
          enqueueSnackBar('Trusted domain validated', {
            variant: SnackBarVariant.Success,
          });
        },
        onError: () => {
          enqueueSnackBar('Error validating trusted domain', {
            variant: SnackBarVariant.Error,
          });
        },
      });
    }
    // Validate trusted domain only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
