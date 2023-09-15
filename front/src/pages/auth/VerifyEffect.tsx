import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';

import { AppPath } from '../../modules/types/AppPath';
import { isNonEmptyString } from '../../utils/isNonEmptyString';

export function VerifyEffect() {
  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');

  const isLogged = useIsLogged();
  const navigate = useNavigate();

  const { verify } = useAuth();

  useEffect(() => {
    async function getTokens() {
      if (!loginToken) {
        navigate(AppPath.SignIn);
      } else {
        const verifyResponse = await verify(loginToken);

        if (
          isNonEmptyString(
            verifyResponse.user.workspaceMember?.workspace.displayName,
          )
        ) {
          navigate(AppPath.Index);
        } else {
          navigate(AppPath.CreateWorkspace);
        }
      }
    }

    if (!isLogged) {
      getTokens();
    }
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
