import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';

type FrontComponentRendererProviderProps = {
  frontComponentId: string;
  children: React.ReactNode;
};

export const FrontComponentRendererProvider = ({
  frontComponentId,
  children,
}: FrontComponentRendererProviderProps) => {
  return (
    <FrontComponentInstanceContext.Provider
      value={{ instanceId: frontComponentId }}
    >
      {children}
    </FrontComponentInstanceContext.Provider>
  );
};
