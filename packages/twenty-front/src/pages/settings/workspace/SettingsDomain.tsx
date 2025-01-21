import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import { H2Title, Section } from 'twenty-ui';
import { z } from 'zod';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { isDefined } from '~/utils/isDefined';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type Form = {
  subdomain: string;
};

const StyledDomainFromWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const StyledDomain = styled.h2`
  align-self: flex-start;
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: ${({ theme }) => theme.spacing(2)};
`;

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

  const domainConfiguration = useRecoilValue(domainConfigurationState);

  const { enqueueSnackBar } = useSnackBar();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const {
    control,
    watch,
    getValues,
    formState: { isValid },
  } = useForm<Form>({
    mode: 'onChange',
    delayError: 500,
    defaultValues: {
      subdomain: currentWorkspace?.subdomain ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

  const subdomainValue = watch('subdomain');

  const handleSave = async () => {
    try {
      const values = getValues();

      if (!values || !isValid || !currentWorkspace) {
        throw new Error(t`Invalid form values`);
      }

      await updateWorkspace({
        variables: {
          input: {
            subdomain: values.subdomain,
          },
        },
      });

      setCurrentWorkspace({
        ...currentWorkspace,
        subdomain: values.subdomain,
      });

      redirectToWorkspaceDomain(values.subdomain);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === t`Subdomain already taken` ||
          error.message.endsWith(t`not allowed`))
      ) {
        control.setError('subdomain', {
          type: 'manual',
          message: (error as Error).message,
        });
        return;
      }

      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
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
            !isValid || subdomainValue === currentWorkspace?.subdomain
          }
          onCancel={() => navigate(SettingsPath.Workspace)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Domain`}
            description={t`Set the name of your subdomain`}
          />
          {currentWorkspace?.subdomain && (
            <StyledDomainFromWrapper>
              <Controller
                name="subdomain"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <>
                    <TextInputV2
                      value={value}
                      type="text"
                      onChange={onChange}
                      error={error?.message}
                      fullWidth
                    />
                    {isDefined(domainConfiguration.frontDomain) && (
                      <StyledDomain>
                        .{domainConfiguration.frontDomain}
                      </StyledDomain>
                    )}
                  </>
                )}
              />
            </StyledDomainFromWrapper>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
