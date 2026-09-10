import { approvedAccessDomainsState } from '@/settings/security/states/ApprovedAccessDomainsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { ValidateApprovedAccessDomainDocument } from '~/generated-metadata/graphql';

export const SettingsSecurityApprovedAccessDomainValidationEffect = () => {
  const [validateApprovedAccessDomainMutation] = useMutation(
    ValidateApprovedAccessDomainDocument,
  );
  const { enqueueToast } = useToast();
  const [searchParams] = useSearchParams();
  const approvedAccessDomainId = searchParams.get('wtdId');
  const validationToken = searchParams.get('validationToken');
  const setApprovedAccessDomains = useSetAtomState(approvedAccessDomainsState);

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
          enqueueToast({
            variant: 'success',
            children: t`Approved access domain validated`,
            dedupeKey: 'approved-access-domain-validation-dedupe-key',
          });
        },
        onError: (error) => {
          enqueueToast({
            variant: 'error',
            children: error?.message
              ? error.message
              : t`Error validating approved access domain`,
            dedupeKey: 'approved-access-domain-validation-error-dedupe-key',
          });
        },
      });
    }
    // Validate approved access domain only needs to run once at mount
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
