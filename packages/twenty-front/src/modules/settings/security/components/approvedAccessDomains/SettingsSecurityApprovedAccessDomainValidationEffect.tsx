import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useValidateApprovedAccessDomainMutation } from '~/generated-metadata/graphql';

export const SettingsSecurityApprovedAccessDomainValidationEffect = () => {
  const [validateApprovedAccessDomainMutation] =
    useValidateApprovedAccessDomainMutation();
  const { enqueueSnackBar } = useSnackBar();
  const [searchParams] = useSearchParams();
  const approvedAccessDomainId = searchParams.get('wtdId');
  const validationToken = searchParams.get('validationToken');

  useEffect(() => {
    if (isDefined(validationToken) && isDefined(approvedAccessDomainId)) {
      validateApprovedAccessDomainMutation({
        variables: {
          input: {
            validationToken,
            approvedAccessDomainId,
          },
        },
        onCompleted: () => {
          enqueueSnackBar('Approved access domain validated', {
            dedupeKey: 'approved-access-domain-validation-dedupe-key',
            variant: SnackBarVariant.Success,
          });
        },
        onError: () => {
          enqueueSnackBar('Error validating approved access domain', {
            dedupeKey: 'approved-access-domain-validation-error-dedupe-key',
            variant: SnackBarVariant.Error,
          });
        },
      });
    }
    // Validate approved access domain only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
