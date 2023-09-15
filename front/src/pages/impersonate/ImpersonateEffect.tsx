import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useImpersonateMutation } from '~/generated/graphql';

import { AppPath } from '../../modules/types/AppPath';
import { isNonEmptyString } from '../../utils/isNonEmptyString';

export const ImpersonateEffect = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const setTokenPair = useSetRecoilState(tokenPairState);

  const [impersonate] = useImpersonateMutation();

  const isLogged = useIsLogged();

  const handleImpersonate = useCallback(async () => {
    if (!isNonEmptyString(userId)) {
      return;
    }

    const impersonateResult = await impersonate({
      variables: { userId },
    });

    if (impersonateResult.errors) {
      throw impersonateResult.errors;
    }

    if (!impersonateResult.data?.impersonate) {
      throw new Error('No impersonate result');
    }

    setCurrentUser(impersonateResult.data?.impersonate.user);
    setTokenPair(impersonateResult.data?.impersonate.tokens);

    return impersonateResult.data?.impersonate;
  }, [userId, impersonate, setCurrentUser, setTokenPair]);

  useEffect(() => {
    if (isLogged && currentUser?.canImpersonate && isNonEmptyString(userId)) {
      handleImpersonate();
    } else {
      // User is not allowed to impersonate or not logged in
      navigate(AppPath.Index);
    }
  }, [userId, currentUser, isLogged, handleImpersonate, navigate]);

  return <></>;
};
