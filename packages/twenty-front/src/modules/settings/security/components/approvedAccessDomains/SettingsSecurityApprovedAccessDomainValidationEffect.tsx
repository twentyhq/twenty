import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useSetRecoilState } from 'recoil';
import { useValidateApprovedAccessDomainMutation } from '~/generated-metadata/graphql';
import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';

export const SettingsSecurityApprovedAccessDomainValidationEffect = () => {
  const [validateApprovedAccessDomainMutation] =
    useValidateApprovedAccessDomainMutation();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [searchParams] = useSearchParams();
  const approvedAccessDomainId = searchParams.get('wtdId');
  const validationToken = searchParams.get('validationToken');
  const setApprovedAccessDomains = useSetRecoilState(
    approvedAccessDomainsState,
  );

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
          setApprovedAccessDomains((approvedAccessDomains) =>
            approvedAccessDomains.map((approvedAccessDomain) => ({
              ...approvedAccessDomain,
              isValidated:
                approvedAccessDomain.id === approvedAccessDomainId
                  ? true
                  : approvedAccessDomain.isValidated,
            })),
          );
          enqueueSuccessSnackBar({
            message: t`Approved access domain validated`,
            options: {
              dedupeKey: 'approved-access-domain-validation-dedupe-key',
            },
          });
        },
        onError: (error) => {
          const message = error?.message
            ? error.message
            : 'Error validating approved access domain';
          enqueueErrorSnackBar({
            message: t`${message}`,
            options: {
              dedupeKey: 'approved-access-domain-validation-error-dedupe-key',
            },
          });
        },
      });
    }
    // Validate approved access domain only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
