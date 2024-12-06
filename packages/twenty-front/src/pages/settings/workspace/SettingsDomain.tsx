import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { zodResolver } from '@hookform/resolvers/zod';
import { H2Title, Section } from 'twenty-ui';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from '@emotion/styled';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useNavigate } from 'react-router-dom';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { isDefined } from '~/utils/isDefined';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';

const validationSchema = z
  .object({
    subdomain: z
      .string()
      .min(3, { message: 'Subdomain can not be shorter than 3 characters' })
      .max(30, { message: 'Subdomain can not be longer than 30 characters' })
      .regex(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/, {
        message:
          'Use letter, number and dash only. Start and finish with a letter or a number',
      }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

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
  const navigate = useNavigate();

  const domainConfiguration = useRecoilValue(domainConfigurationState);

  const { enqueueSnackBar } = useSnackBar();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();

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
        throw new Error('Invalid form values');
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

      window.location.href = buildWorkspaceUrl(values.subdomain);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Subdomain already taken'
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
      title="General"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'General',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Domain' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={
            !isValid || subdomainValue === currentWorkspace?.subdomain
          }
          onCancel={() => navigate(getSettingsPagePath(SettingsPath.Workspace))}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="Domain"
            description="Set the name of your subdomain"
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
