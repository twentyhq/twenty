import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useRecoilValue } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { useMemo } from 'react';
import { Loader, MainButton } from 'twenty-ui';

import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { PublicWorkspaceDataOutput } from '~/generated/graphql';

const StyledContentContainer = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(10)};
`;

const StandardContent = ({
  workspacePublicData,
  signInUpForm,
  title,
}: {
  workspacePublicData: PublicWorkspaceDataOutput | null;
  signInUpForm: JSX.Element | null;
  title: string;
}) => {
  return (
    <>
      <Logo secondaryLogo={workspacePublicData?.logo} />
      <Title animate={false}>{title}</Title>
      {signInUpForm}
    </>
  );
};

export const SignInUpLoading = () => {
  const { t } = useLingui();
  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const { workspaceInviteHash, workspace: workspaceFromInviteHash } =
    useWorkspaceFromInviteHash();

  const title = useMemo(() => {
    if (isDefined(workspaceInviteHash)) {
      return `Join ${workspaceFromInviteHash?.displayName ?? ''} team`;
    }
    const workspaceName = !isDefined(workspacePublicData?.displayName)
      ? DEFAULT_WORKSPACE_NAME
      : workspacePublicData?.displayName === ''
        ? t`Your Workspace`
        : workspacePublicData?.displayName;

    return t`Welcome to ${workspaceName}`;
  }, [
    workspaceFromInviteHash?.displayName,
    workspaceInviteHash,
    workspacePublicData?.displayName,
    t,
  ]);

  return (
    <StandardContent
      workspacePublicData={workspacePublicData}
      signInUpForm={
        <>
          <StyledContentContainer>
            <StyledForm>
              <MainButton
                disabled={true}
                title={'Continue'}
                type="submit"
                variant={'primary'}
                Icon={() => <Loader />}
                fullWidth
              />
            </StyledForm>
          </StyledContentContainer>
        </>
      }
      title={title}
    />
  );
};
