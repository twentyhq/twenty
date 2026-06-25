import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { isDefaultPageLayoutId } from '@/page-layout/utils/isDefaultPageLayoutId';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ReactNode } from 'react';

type RecordPageLayoutEditModeProviderProps = {
  pageLayoutId: string;
  children: ReactNode;
};

export const RecordPageLayoutEditModeProvider = ({
  pageLayoutId,
  children,
}: RecordPageLayoutEditModeProviderProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { isInSidePanel } = useLayoutRenderingContext();

  const isEditable = !isDefaultPageLayoutId(pageLayoutId);

  return (
    <PageLayoutEditModeProviderContext
      value={{
        isInEditMode:
          isLayoutCustomizationModeEnabled && !isInSidePanel && isEditable,
      }}
    >
      {children}
    </PageLayoutEditModeProviderContext>
  );
};
