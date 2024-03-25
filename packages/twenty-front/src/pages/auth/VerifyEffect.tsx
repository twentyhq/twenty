import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AppPath } from '@/types/AppPath';

export const VerifyEffect = () => {
  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const isLogged = useIsLogged();
  const navigate = useNavigate();

  const { verify } = useAuth();

  useEffect(() => {
    const getTokens = async () => {
      if (!loginToken) {
        navigate(AppPath.SignInUp);
      } else {
        await verify(loginToken);

        if (currentWorkspace?.activationStatus === 'active') {
          navigate(AppPath.Index);
        } else {
          navigate(AppPath.CreateWorkspace);
        }
      }
    };

    if (!isLogged) {
      getTokens();
    }
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
