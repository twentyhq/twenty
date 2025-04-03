// create a react component that has the same strucutre than @AppThemeProvider
// but it will be used to wrap the @UserThemeProviderEffect

import { UserThemeProviderEffect } from '@/ui/theme/components/AppThemeProvider';
import { useSearchParams } from 'react-router-dom';

export const UserThemeProviderContainer = () => {
  const [searchParams] = useSearchParams();
  if (searchParams.get('disableDataLoad') === 'true') {
    return null;
  }
  return <UserThemeProviderEffect />;
};
