import { EngineCommandIdContext } from '@/command-menu-item/engine-command/contexts/EngineCommandIdContext';

export const DefaultPageEngineCommandContextProviders = ({
  engineCommandId,
  children,
}: {
  engineCommandId: string;
  children: React.ReactNode;
}) => {
  return (
    <EngineCommandIdContext.Provider value={engineCommandId}>
      {children}
    </EngineCommandIdContext.Provider>
  );
};
