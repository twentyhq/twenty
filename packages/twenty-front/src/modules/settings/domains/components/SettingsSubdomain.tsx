import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { getSubdomainValidationSchema } from '@/settings/domains/utils/getSubdomainValidationSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

const SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID =
  'subdomain-change-confirmation-modal';

const StyledDomainFormWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const StyledSaveButtonContainer = styled.div`
  margin-left: auto;
  margin-top: 8px;
`;

export const SettingsSubdomain = () => {
  const { t } = useLingui();
  const domainConfiguration = useAtomStateValue(domainConfigurationState);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { openModal, closeModal } = useModal();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const subdomainSchema = getSubdomainValidationSchema(t);

  const [subdomain, setSubdomain] = useState(
    currentWorkspace?.subdomain ?? '',
  );
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (value: string) => {
    setSubdomain(value);

    const result = subdomainSchema.safeParse(value);

    setError(result.success ? undefined : result.error.issues[0].message);
  };

  const hasChanged = subdomain !== currentWorkspace?.subdomain;
  const isSaveDisabled = !hasChanged || isDefined(error) || isSubmitting;

  const handleSave = () => {
    if (!isDefined(currentWorkspace)) {
      return;
    }

    openModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);
  };

  const handleConfirm = () => {
    if (!isDefined(currentWorkspace) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    updateWorkspace({
      variables: {
        input: { subdomain },
      },
      onError: (mutationError) => {
        if (
          CombinedGraphQLErrors.is(mutationError) &&
          mutationError.errors[0]?.extensions?.code === 'CONFLICT'
        ) {
          closeModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);
          setError(t`Subdomain already taken`);
          setIsSubmitting(false);

          return;
        }
        if (CombinedGraphQLErrors.is(mutationError)) {
          enqueueErrorSnackBar({ apolloError: mutationError });
        } else {
          enqueueErrorSnackBar({});
        }
        setIsSubmitting(false);
      },
      onCompleted: async () => {
        const currentUrl = new URL(window.location.href);

        currentUrl.hostname = new URL(
          currentWorkspace.workspaceUrls.subdomainUrl,
        ).hostname.replace(currentWorkspace.subdomain, subdomain);

        setCurrentWorkspace({
          ...currentWorkspace,
          subdomain,
        });

        enqueueSuccessSnackBar({ message: t`Subdomain updated` });
        setIsSubmitting(false);

        await redirectToWorkspaceDomain(currentUrl.toString());
      },
    });
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Subdomain`}
          description={t`Set the name of your subdomain`}
        />
        <StyledDomainFormWrapper>
          <TextInput
            value={subdomain}
            type="text"
            onChange={handleChange}
            error={error}
            disabled={!!currentWorkspace?.customDomain}
            rightAdornment={
              isDefined(domainConfiguration.frontDomain)
                ? `.${domainConfiguration.frontDomain}`
                : undefined
            }
            fullWidth
          />
        </StyledDomainFormWrapper>
        <StyledSaveButtonContainer>
          <SaveAndCancelButtons
            isSaveDisabled={isSaveDisabled}
            isLoading={isSubmitting}
            onSave={handleSave}
            onCancel={() => {
              setSubdomain(currentWorkspace?.subdomain ?? '');
              setError(undefined);
            }}
          />
        </StyledSaveButtonContainer>
      </Section>
      <ConfirmationModal
        modalInstanceId={SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID}
        title={t`Change subdomain?`}
        subtitle={t`You're about to change your workspace subdomain. This action will log out all users.`}
        onConfirmClick={handleConfirm}
      />
    </>
  );
};
