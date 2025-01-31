import { useSearchParams } from 'react-router-dom';

export const useIsForceSubdomainUrlEnable = () => {
  const [searchParams] = useSearchParams();

  return {
    isForceSubdomainUrlEnable: !!searchParams.get('force-subdomain-url'),
  };
};
