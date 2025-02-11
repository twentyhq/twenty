import { adminPanelErrorState } from '@/settings/admin-panel/states/adminPanelErrorState';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useUserLookupAdminPanelMutation } from '~/generated/graphql';

export const useUserLookup = () => {
  const setUserLookupResult = useSetRecoilState(userLookupResultState);
  const setError = useSetRecoilState(adminPanelErrorState);
  const [isLoading, setIsLoading] = useState(false);

  const [userLookup] = useUserLookupAdminPanelMutation({
    onCompleted: (data) => {
      setIsLoading(false);
      if (isDefined(data?.userLookupAdminPanel)) {
        setUserLookupResult(data.userLookupAdminPanel);
      }
    },
    onError: (error) => {
      setIsLoading(false);
      setError(error.message);
    },
  });

  const handleUserLookup = async (userIdentifier: string) => {
    setError(null);
    setIsLoading(true);
    setUserLookupResult(null);

    const response = await userLookup({
      variables: { userIdentifier },
    });

    return response.data?.userLookupAdminPanel;
  };

  return {
    handleUserLookup,
    isLoading,
  };
};
