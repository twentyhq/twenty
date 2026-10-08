import { useNavigate } from 'react-router-dom';
import { isAbsoluteUrl } from 'twenty-shared/utils';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

export const useNavigateToNavigationMenuItemLink = () => {
  const navigate = useNavigate();

  const navigateToNavigationMenuItemLink = (link: string) => {
    if (isAbsoluteUrl(link)) {
      openUrlInNewTab(link);
      return;
    }

    navigate(link);
  };

  return { navigateToNavigationMenuItemLink };
};
