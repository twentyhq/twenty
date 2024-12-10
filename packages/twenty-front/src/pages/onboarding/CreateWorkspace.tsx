import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { H2Title, Loader, MainButton } from 'twenty-ui';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import {
  OnboardingStatus,
  useActivateWorkspaceMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { AppPath } from '@/types/AppPath';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';

const StyledContentContainer = styled.div`
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

const validationSchema = z
  .object({
    name: z.string().min(1, { message: 'Name can not be empty' }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

export const CreateWorkspace = () => {
  const { enqueueSnackBar } = useSnackBar();
  const onboardingStatus = useOnboardingStatus();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const [activateWorkspace] = useActivateWorkspaceMutation();
  const apolloMetadataClient = useApolloMetadataClient();
  const setIsCurrentUserLoaded = useSetRecoilState(isCurrentUserLoadedState);

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        const result = await activateWorkspace({
          variables: {
            input: {
              displayName: data.name,
            },
          },
        });

        setIsCurrentUserLoaded(false);

        if (isDefined(result.data) && isMultiWorkspaceEnabled) {
          return redirectToWorkspaceDomain(
            result.data.activateWorkspace.workspace.subdomain,
            AppPath.Verify,
            {
              loginToken: result.data.activateWorkspace.loginToken.token,
            },
          );
        }

        await apolloMetadataClient?.refetchQueries({
          include: [FIND_MANY_OBJECT_METADATA_ITEMS],
        });

        if (isDefined(result.errors)) {
          throw result.errors ?? new Error('Unknown error');
        }
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: SnackBarVariant.Error,
        });
      }
    },
    [
      activateWorkspace,
      setIsCurrentUserLoaded,
      isMultiWorkspaceEnabled,
      apolloMetadataClient,
      redirectToWorkspaceDomain,
      enqueueSnackBar,
    ],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  if (onboardingStatus !== OnboardingStatus.WorkspaceActivation) {
    return null;
  }

  return (
    <>
      <Title noMarginTop>Create your workspace</Title>
      <SubTitle>
        A shared environment where you will be able to manage your customer
        relations with your team.
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title="Workspace logo" />
          <WorkspaceLogoUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title
            title="Workspace name"
            description="The name of your organization"
          />
          <Controller
            name="name"
            control={control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextInputV2
                autoFocus
                value={value}
                placeholder="Apple"
                onBlur={onBlur}
                onChange={onChange}
                error={error?.message}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            )}
          />
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton
          title="Continue"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          Icon={() => isSubmitting && <Loader />}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
};
