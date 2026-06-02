import { useMutation, useQuery } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Trans, useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsEmailingDomainVerificationRecords } from '@/settings/emailing-domains/components/SettingsEmailingDomainVerificationRecords';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  DeleteEmailingDomainDocument,
  type GetEmailingDomainsQuery,
  GetEmailingDomainsDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_EMAILING_DOMAIN_MODAL_ID = 'delete-emailing-domain-modal';

export const SettingsEmailingDomainDetail = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { domainId } = useParams<{ domainId: string }>();

  const { data, loading, error } = useQuery<GetEmailingDomainsQuery>(
    GetEmailingDomainsDocument,
    {
      skip: !domainId,
    },
  );

  const { openModal } = useModal();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [deleteEmailingDomain, { loading: deleting }] = useMutation(
    DeleteEmailingDomainDocument,
    { refetchQueries: [GetEmailingDomainsDocument] },
  );

  const emailingDomain = data?.getEmailingDomains?.find(
    (domain) => domain.id === domainId,
  );

  if (loading) {
    return <SettingsEmptyPlaceholder>{t`Loading...`}</SettingsEmptyPlaceholder>;
  }

  if (isDefined(error) || !isDefined(emailingDomain)) {
    return (
      <SettingsEmptyPlaceholder>
        <Trans>Domain not found</Trans>
      </SettingsEmptyPlaceholder>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteEmailingDomain({ variables: { id: emailingDomain.id } });
      enqueueSuccessSnackBar({
        message: t`Emailing domain deleted successfully`,
      });
      navigateSettings(SettingsPath.WorkspaceEmail);
    } catch (deleteError) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(deleteError)
          ? { apolloError: deleteError }
          : {}),
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={emailingDomain.domain}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Email</Trans>,
          href: getSettingsPath(SettingsPath.WorkspaceEmail),
        },
        { children: emailingDomain.domain },
      ]}
      actionButton={
        <Button
          Icon={IconTrash}
          title={t`Delete`}
          variant="secondary"
          accent="danger"
          size="small"
          disabled={deleting}
          onClick={() => openModal(DELETE_EMAILING_DOMAIN_MODAL_ID)}
        />
      }
    >
      <SettingsPageContainer>
        {emailingDomain.verificationRecords &&
          emailingDomain.verificationRecords.length > 0 && (
            <SettingsEmailingDomainVerificationRecords
              domain={emailingDomain}
            />
          )}
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_EMAILING_DOMAIN_MODAL_ID}
        title={t`Delete emailing domain`}
        subtitle={t`Are you sure you want to delete ${emailingDomain.domain}? Outbound mail through this domain will stop working.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
        loading={deleting}
      />
    </SubMenuTopBarContainer>
  );
};
