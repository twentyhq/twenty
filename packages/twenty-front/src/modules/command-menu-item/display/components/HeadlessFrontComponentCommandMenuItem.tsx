import { useMountHeadlessFrontComponent } from '@/front-components/hooks/useMountHeadlessFrontComponent';
import { isHeadlessFrontComponentMountedFamilySelector } from '@/front-components/selectors/isHeadlessFrontComponentMountedFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

import { HeadlessCommandMenuItem } from './HeadlessCommandMenuItem';

export const HeadlessFrontComponentCommandMenuItem = ({
  frontComponentId,
  commandMenuItemId,
  recordId,
  objectNameSingular,
}: {
  frontComponentId: string;
  commandMenuItemId: string;
  recordId?: string;
  objectNameSingular?: string;
}) => {
  const mountHeadlessFrontComponent = useMountHeadlessFrontComponent();

  const isMounted = useAtomFamilySelectorValue(
    isHeadlessFrontComponentMountedFamilySelector,
    frontComponentId,
  );

  const handleClick = () => {
    mountHeadlessFrontComponent(frontComponentId, {
      commandMenuItemId,
      recordId,
      objectNameSingular,
    });
  };

  return (
    <HeadlessCommandMenuItem
      isMounted={isMounted}
      commandMenuItemId={commandMenuItemId}
      onClick={handleClick}
    />
  );
};
