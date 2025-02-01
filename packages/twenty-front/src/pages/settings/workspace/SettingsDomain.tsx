import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilState } from 'recoil';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  FeatureFlagKey,
  useUpdateWorkspaceMutation,
} from '~/generated/graphql';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { SettingsHostname } from '~/pages/settings/workspace/SettingsHostname';
import { SettingsSubdomain } from '~/pages/settings/workspace/SettingsSubdomain';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { ApolloError } from '@apollo/client';
import { Trans, useLingui } from '@lingui/react/macro';
import { z } from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsHostnameEffect } from '~/pages/settings/workspace/SettingsHostnameEffect';

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
  }>({
    mode: 'onChange',
    delayError: 500,
    defaultValues: {
      subdomain: currentWorkspace?.subdomain ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

  const subdomainValue = form.watch('subdomain');

  const handleSave = async () => {
    const values = form.getValues();

    if (!values || !form.formState.isValid || !currentWorkspace) {
      return enqueueSnackBar(t`Invalid form values`, {
        variant: SnackBarVariant.Error,
      });
    }

    await updateWorkspace({
      variables: {
        input: {
          subdomain: values.subdomain,
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
        setCurrentWorkspace({
          ...currentWorkspace,
          subdomain: values.subdomain,
        });

        redirectToWorkspaceDomain(values.subdomain);
      },
    });
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
            subdomainValue === currentWorkspace?.subdomain
          }
          onCancel={() => navigate(SettingsPath.Workspace)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...form}>
          {isCustomDomainEnabled && (
            <>
              <SettingsHostnameEffect />
              <SettingsHostname />
            </>
          )}
          {(!currentWorkspace?.hostname || !isCustomDomainEnabled) && (
            <SettingsSubdomain />
          )}
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
