import { MessageThreadSubscribersTopBar } from '@/activities/right-drawer/components/MessageThreadSubscribersTopBar';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { rightDrawerPageState } from '@/ui/layout/right-drawer/states/rightDrawerPageState';
import { ComponentByRightDrawerPage } from '@/ui/layout/right-drawer/types/ComponentByRightDrawerPage';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

const RIGHT_DRAWER_TOP_BAR_DROPDOWN_BUTTON_CONFIG: ComponentByRightDrawerPage =
  {
    [RightDrawerPages.ViewEmailThread]: <MessageThreadSubscribersTopBar />,
  };

export const RightDrawerTopBarDropdownButton = () => {
  const [isRightDrawerMinimized] = useRecoilState(isRightDrawerMinimizedState);

  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  if (isRightDrawerMinimized || !isDefined(rightDrawerPage)) {
    return null;
  }

  const dropdownButtonComponent =
    RIGHT_DRAWER_TOP_BAR_DROPDOWN_BUTTON_CONFIG[rightDrawerPage];

  return dropdownButtonComponent ?? <></>;
};
