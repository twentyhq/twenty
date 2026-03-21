import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsCustomDomain } from '@/settings/domains/components/SettingsCustomDomain';
import { SettingsSubdomain } from '@/settings/domains/components/SettingsSubdomain';
import { getSubdomainValidationSchema } from '@/settings/domains/utils/getSubdomainValidationSchema';
import { getDomainValidationSchema } from '@/settings/domains/utils/getDomainValidationSchema';
import { useCheckCustomDomainValidRecords } from '@/settings/domains/hooks/useCheckCustomDomainValidRecords';
import { isCloudflareIntegrationEnabledState } from '@/client-config/states/isCloudflareIntegrationEnabledState';

export const SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID =
  'subdomain-change-confirmation-modal';

export const SettingsDomain = () => {
  const navigate = useNavigateSettings();
  const { checkCustomDomainRecords } = useCheckCustomDomainValidRecords();
  const { t } = useLingui();
  const isCloudflareIntegrationEnabled = useAtomStateValue(
    isCloudflareIntegrationEnabledState,
  );

  const subdomainSchema = getSubdomainValidationSchema(t);
  const domainSchema = getDomainValidationSchema(t);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const { openModal, closeModal } = useModal();

  const [subdomain, setSubdomain] = useState(currentWorkspace?.subdomain ?? '');
  const [customDomain, setCustomDomain] = useState<string | null>(
    currentWorkspace?.customDomain ?? '',
  );
  const [subdomainError, setSubdomainError] = useState<string | undefined>();
  const [customDomainError, setCustomDomainError] = useState<
    string | undefined
  >();

  const handleSubdomainChange = (value: string) => {
    setSubdomain(value);

    const result = subdomainSchema.safeParse(value);

    setSubdomainError(
      result.success ? undefined : result.error.issues[0].message,
    );
  };

  const handleCustomDomainChange = (value: string) => {
    setCustomDomain(value);

    const result = domainSchema.safeParse(value);

    setCustomDomainError(
      result.success ? undefined : result.error.issues[0].message,
    );
  };

  const handleCustomDomainDelete = () => {
    setCustomDomain('');
    setCustomDomainError(undefined);
  };

  const hasSubdomainChanged = subdomain !== currentWorkspace?.subdomain;
  const hasCustomDomainChanged =
    customDomain !== (currentWorkspace?.customDomain ?? '');
  const hasChanges = hasSubdomainChanged || hasCustomDomainChanged;
  const hasErrors = isDefined(subdomainError) || isDefined(customDomainError);
  const isSaveDisabled = !hasChanges || hasErrors || isSubmitting;

  const updateCustomDomainMutation = (
    newCustomDomain: string | null,
    workspace: CurrentWorkspace,
  ) => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    updateWorkspace({
      variables: {
        input: {
          customDomain:
            isDefined(newCustomDomain) && newCustomDomain.length > 0
              ? newCustomDomain
              : null,
        },
      },
      onCompleted: () => {
        setCurrentWorkspace({
          ...workspace,
          customDomain:
            newCustomDomain && newCustomDomain.length > 0
              ? newCustomDomain
              : null,
        });
        enqueueSuccessSnackBar({
          message: t`Custom domain updated`,
        });
        setIsSubmitting(false);
        checkCustomDomainRecords();
      },
      onError: (error) => {
        if (
          CombinedGraphQLErrors.is(error) &&
          error.errors[0]?.extensions?.code === 'CONFLICT'
        ) {
          setSubdomainError(t`Subdomain already taken`);
          setIsSubmitting(false);

          return;
        }
        if (CombinedGraphQLErrors.is(error)) {
          enqueueErrorSnackBar({
            apolloError: error,
          });
        } else {
          enqueueErrorSnackBar({});
        }
        setIsSubmitting(false);
      },
    });
  };

  const updateSubdomainMutation = (
    newSubdomain: string,
    workspace: CurrentWorkspace,
  ) => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    updateWorkspace({
      variables: {
        input: {
          subdomain: newSubdomain,
        },
      },
      onError: (error) => {
        if (
          CombinedGraphQLErrors.is(error) &&
          error.errors[0]?.extensions?.code === 'CONFLICT'
        ) {
          closeModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);
          setSubdomainError(t`Subdomain already taken`);
          setIsSubmitting(false);

          return;
        }
        if (CombinedGraphQLErrors.is(error)) {
          enqueueErrorSnackBar({
            apolloError: error,
          });
        } else {
          enqueueErrorSnackBar({});
        }
        setIsSubmitting(false);
      },
      onCompleted: async () => {
        const currentUrl = new URL(window.location.href);

        currentUrl.hostname = new URL(
          workspace.workspaceUrls.subdomainUrl,
        ).hostname.replace(workspace.subdomain, newSubdomain);

        setCurrentWorkspace({
          ...workspace,
          subdomain: newSubdomain,
        });

        enqueueSuccessSnackBar({
          message: t`Subdomain updated`,
        });
        setIsSubmitting(false);

        await redirectToWorkspaceDomain(currentUrl.toString());
      },
    });
  };

  const handleSave = () => {
    if (!isDefined(currentWorkspace)) {
      return enqueueErrorSnackBar({
        message: t`Invalid form values`,
      });
    }

    if (hasSubdomainChanged) {
      openModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);

      return;
    }

    if (hasCustomDomainChanged) {
      return updateCustomDomainMutation(customDomain, currentWorkspace);
    }
  };

  return (
    <>
      <SubMenuTopBarContainer
        title={t`Domain`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: <Trans>Domains</Trans>,
            href: getSettingsPath(SettingsPath.Domains),
          },
          { children: <Trans>Domain</Trans> },
        ]}
        actionButton={
          <SaveAndCancelButtons
            onCancel={() => navigate(SettingsPath.Domains)}
            isSaveDisabled={isSaveDisabled}
            isLoading={isSubmitting}
            onSave={handleSave}
          />
        }
      >
        <SettingsPageContainer>
          <SettingsSubdomain
            value={subdomain}
            onChange={handleSubdomainChange}
            error={subdomainError}
          />
          {isCloudflareIntegrationEnabled && (
            <SettingsCustomDomain
              value={customDomain}
              onChange={handleCustomDomainChange}
              onDelete={handleCustomDomainDelete}
              error={customDomainError}
            />
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
      <ConfirmationModal
        modalInstanceId={SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID}
        title={t`Change subdomain?`}
        subtitle={t`You're about to change your workspace subdomain. This action will log out all users.`}
        onConfirmClick={() => {
          currentWorkspace &&
            updateSubdomainMutation(subdomain, currentWorkspace);
        }}
      />
    </>
  );
};
