import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { IconExternalLink, LightIconButton, UndecoratedLink } from 'twenty-ui';

export const RightDrawerTopBarExpandButton = ({ to }: { to: string }) => {
  const { closeRightDrawer } = useRightDrawer();

  return (
    <UndecoratedLink to={to}>
      <LightIconButton
        size="medium"
        accent="tertiary"
        Icon={IconExternalLink}
        onClick={closeRightDrawer}
      />
    </UndecoratedLink>
  );
};
