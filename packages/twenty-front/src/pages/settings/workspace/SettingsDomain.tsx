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
import { useUrlManager } from '@/url-manager/hooks/useUrlManager';
import { urlManagerState } from '@/url-manager/states/url-manager.state';
import { isDefined } from '~/utils/isDefined';

const validationSchema = z
  .object({
    subdomain: z
      .string()
      .min(1, { message: 'Subdomain can not be empty' })
      .max(63, { message: 'Subdomain can not be longer than 63 characters' }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

const StyledDomainFromWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const StyledDomain = styled.h2`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: 8px;
`;

export const SettingsDomain = () => {
  const navigate = useNavigate();

  const urlManager = useRecoilValue(urlManagerState);

  const { enqueueSnackBar } = useSnackBar();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const { buildWorkspaceUrl } = useUrlManager();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

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
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      subdomain: currentWorkspace?.subdomain ?? '',
    },
    resolver: zodResolver(validationSchema),
  });

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
          isSaveDisabled={!isValid}
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
                  <TextInputV2
                    value={value}
                    type="text"
                    onChange={onChange}
                    error={error?.message}
                    fullWidth
                  />
                )}
              />
              {isDefined(urlManager) && isDefined(urlManager.frontDomain) && (
                <StyledDomain>.{urlManager.frontDomain}</StyledDomain>
              )}
            </StyledDomainFromWrapper>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
