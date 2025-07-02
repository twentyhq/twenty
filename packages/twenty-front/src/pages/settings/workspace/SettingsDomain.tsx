import {
  CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ApolloError } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsCustomDomain } from '~/pages/settings/workspace/SettingsCustomDomain';
import { SettingsSubdomain } from '~/pages/settings/workspace/SettingsSubdomain';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID =
  'subdomain-change-confirmation-modal';

export const SettingsDomain = () => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();

  const validationSchema = z
    .object({
      subdomain: z
        .string()
        .min(3, { message: t`Subdomain can not be shorter than 3 characters` })
        .max(30, { message: t`Subdomain can not be longer than 30 characters` })
        .regex(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/, {
          message: t`Use letter, number and dash only. Start and finish with a letter or a number`,
        }),
      customDomain: z
        .string()
        .regex(
          /^([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/,
          {
            message: t`Invalid custom domain. Please include at least one subdomain (e.g., sub.example.com).`,
          },
        )
        .regex(
          /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
          {
            message: t`Invalid domain. Domains have to be smaller than 256 characters in length, cannot be IP addresses, cannot contain spaces, cannot contain any special characters such as _~\`!@#$%^*()=+{}[]|\\;:'",<>/? and cannot begin or end with a '-' character.`,
          },
        )
        .max(256)
        .optional()
        .or(z.literal('')),
    })
    .required();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const { openModal, closeModal } = useModal();

  const form = useForm<{
    subdomain: string;
    customDomain: string | null;
  }>({
    mode: 'onSubmit',
    delayError: 500,
    defaultValues: {
      subdomain: currentWorkspace?.subdomain ?? '',
      customDomain: currentWorkspace?.customDomain ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

  const subdomainValue = form.watch('subdomain');
  const customDomainValue = form.watch('customDomain');

  const updateCustomDomain = (
    customDomain: string | null,
    currentWorkspace: CurrentWorkspace,
  ) => {
    updateWorkspace({
      variables: {
        input: {
          customDomain:
            isDefined(customDomain) && customDomain.length > 0
              ? customDomain
              : null,
        },
      },
      onCompleted: () => {
        setCurrentWorkspace({
          ...currentWorkspace,
          customDomain:
            customDomain && customDomain.length > 0 ? customDomain : null,
        });
        enqueueSuccessSnackBar({
          message: t`Custom domain updated`,
        });
      },
      onError: (error: ApolloError) => {
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.code === 'CONFLICT'
        ) {
          return form.control.setError('subdomain', {
            type: 'manual',
            message: t`Subdomain already taken`,
          });
        }
        enqueueErrorSnackBar({
          apolloError: error,
        });
      },
    });
  };

  const updateSubdomain = (
    subdomain: string,
    currentWorkspace: CurrentWorkspace,
  ) => {
    updateWorkspace({
      variables: {
        input: {
          subdomain,
        },
      },
      onError: (error: ApolloError) => {
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.code === 'CONFLICT'
        ) {
          closeModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);
          return form.control.setError('subdomain', {
            type: 'manual',
            message: t`Subdomain already taken`,
          });
        }
        enqueueErrorSnackBar({
          apolloError: error,
        });
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

        enqueueSuccessSnackBar({
          message: t`Subdomain updated`,
        });

        await redirectToWorkspaceDomain(currentUrl.toString());
      },
    });
  };

  const handleSave = async () => {
    const values = form.getValues();

    if (
      subdomainValue === currentWorkspace?.subdomain &&
      customDomainValue === currentWorkspace?.customDomain
    ) {
      return enqueueErrorSnackBar({
        message: t`No change detected`,
      });
    }

    if (!values || !currentWorkspace) {
      return enqueueErrorSnackBar({
        message: t`Invalid form values`,
      });
    }

    if (
      isDefined(values.subdomain) &&
      values.subdomain !== currentWorkspace.subdomain
    ) {
      openModal(SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID);
      return;
    }

    if (values.customDomain !== currentWorkspace.customDomain) {
      return updateCustomDomain(values.customDomain, currentWorkspace);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSave)}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...form}>
          <SubMenuTopBarContainer
            title={t`Domain`}
            links={[
              {
                children: <Trans>Workspace</Trans>,
                href: getSettingsPath(SettingsPath.Workspace),
              },
              {
                children: <Trans>General</Trans>,
                href: getSettingsPath(SettingsPath.Workspace),
              },
              { children: <Trans>Domain</Trans> },
            ]}
            actionButton={
              <SaveAndCancelButtons
                onCancel={() => navigate(SettingsPath.Workspace)}
                isSaveDisabled={form.formState.isSubmitting}
              />
            }
          >
            <SettingsPageContainer>
              <SettingsSubdomain />
              <SettingsCustomDomain />
            </SettingsPageContainer>
          </SubMenuTopBarContainer>
        </FormProvider>
      </form>
      <ConfirmationModal
        modalId={SUBDOMAIN_CHANGE_CONFIRMATION_MODAL_ID}
        title={t`Change subdomain?`}
        subtitle={t`You're about to change your workspace subdomain. This action will log out all users.`}
        onConfirmClick={() => {
          const values = form.getValues();
          currentWorkspace &&
            updateSubdomain(values.subdomain, currentWorkspace);
        }}
      />
    </>
  );
};
