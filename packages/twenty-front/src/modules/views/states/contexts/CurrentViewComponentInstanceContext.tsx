import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';

export const CurrentViewComponentInstanceContext =
  createComponentInstanceContext();

type CurrentViewComponentInstanceContextProviderProps = {
  recordIndexId: string;
  children: React.ReactNode;
};

export const CurrentViewComponentInstanceContextProvider = ({
  recordIndexId,
  children,
}: CurrentViewComponentInstanceContextProviderProps) => {
  const currentViewId =
    useRecoilComponentValueV2(currentViewIdComponentState, recordIndexId) ??
    'none';

  return (
    <CurrentViewComponentInstanceContext.Provider
      value={{ instanceId: currentViewId }}
    >
      {children}
    </CurrentViewComponentInstanceContext.Provider>
  );
};
