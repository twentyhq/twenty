import { ApolloError } from '@apollo/client';
import {
  CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { useRecoilState } from 'recoil';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  FeatureFlagKey,
  useUpdateWorkspaceMutation,
} from '~/generated/graphql';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { SettingsCustomDomain } from '~/pages/settings/workspace/SettingsCustomDomain';
import { SettingsSubdomain } from '~/pages/settings/workspace/SettingsSubdomain';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { Trans, useLingui } from '@lingui/react/macro';
import { z } from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsCustomDomainEffect } from '~/pages/settings/workspace/SettingsCustomDomainEffect';
import { isDefined } from 'twenty-shared';

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
          /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
          {
            message: t`Invalid custom domain. Custom domains have to be smaller than 256 characters in length, cannot be IP addresses, cannot contain spaces, cannot contain any special characters such as _~\`!@#$%^*()=+{}[]|\\;:'",<>/? and cannot begin or end with a '-' character.`,
          },
        )
        .max(256)
        .optional()
        .or(z.literal('')),
    })
    .required();

  const { enqueueSnackBar } = useSnackBar();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const isCustomDomainEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCustomDomainEnabled,
  );

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const form = useForm<{
    subdomain: string;
    customDomain: string | null;
  }>({
    mode: 'onChange',
    delayError: 500,
    defaultValues: {
      subdomain: currentWorkspace?.subdomain ?? '',
      customDomain: currentWorkspace?.customDomain ?? null,
    },
    resolver: zodResolver(validationSchema),
  });

  const subdomainValue = form.watch('subdomain');
  const customDomainValue = form.watch('customDomain');

  const updateCustomDomain = (
    customDomain: string | null | undefined,
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
          customDomain,
        });
      },
      onError: (error) => {
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.code === 'CONFLICT'
        ) {
          return form.control.setError('subdomain', {
            type: 'manual',
            message: t`Subdomain already taken`,
          });
        }
        enqueueSnackBar((error as Error).message, {
          variant: SnackBarVariant.Error,
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
      onError: (error) => {
        if (
          error instanceof ApolloError &&
          error.graphQLErrors[0]?.extensions?.code === 'CONFLICT'
        ) {
          return form.control.setError('subdomain', {
            type: 'manual',
            message: t`Subdomain already taken`,
          });
        }
        enqueueSnackBar((error as Error).message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        const currentUrl = new URL(window.location.href);

        currentUrl.hostname = new URL(
          currentWorkspace.workspaceUrls.subdomainUrl,
        ).hostname.replace(currentWorkspace.subdomain, subdomain);

        setCurrentWorkspace({
          ...currentWorkspace,
          subdomain,
        });

        redirectToWorkspaceDomain(currentUrl.toString());
      },
    });
  };

  const handleSave = async () => {
    const values = form.getValues();

    if (!values || !form.formState.isValid || !currentWorkspace) {
      return enqueueSnackBar(t`Invalid form values`, {
        variant: SnackBarVariant.Error,
      });
    }

    if (
      isDefined(values.subdomain) &&
      values.subdomain !== currentWorkspace.subdomain
    ) {
      return updateSubdomain(values.subdomain, currentWorkspace);
    }

    if (values.customDomain !== currentWorkspace.customDomain) {
      return updateCustomDomain(values.customDomain, currentWorkspace);
    }
  };

  return (
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
          isSaveDisabled={
            !form.formState.isValid ||
            (subdomainValue === currentWorkspace?.subdomain &&
              customDomainValue === currentWorkspace?.customDomain)
          }
          onCancel={() => navigate(SettingsPath.Workspace)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...form}>
          {(!currentWorkspace?.customDomain || !isCustomDomainEnabled) && (
            <SettingsSubdomain />
          )}
          {isCustomDomainEnabled && (
            <>
              <SettingsCustomDomainEffect />
              <SettingsCustomDomain />
            </>
          )}
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
