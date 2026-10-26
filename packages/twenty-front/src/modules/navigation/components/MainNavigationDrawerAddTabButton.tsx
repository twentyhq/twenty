import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';

import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';

type MainNavigationDrawerAddTabButtonProps = {
  isExpanded: boolean;
};

export const MainNavigationDrawerAddTabButton = ({
  isExpanded,
}: MainNavigationDrawerAddTabButtonProps) => {
  const { t } = useLingui();
  const { createTab } = useCreateNavigationMenuTabOrSection();

  return (
    <LightIconButton
      emphasis="subtle"
      size={isExpanded ? 'sm' : 'md'}
      aria-label={t`Add tab`}
      onClick={createTab}
    >
      <IconPlus />
    </LightIconButton>
  );
};
