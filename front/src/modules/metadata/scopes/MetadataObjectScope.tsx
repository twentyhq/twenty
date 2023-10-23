import { ReactNode } from 'react';

import { MetadataObjectScopeInternalContext } from './scope-internal-context/MetadataObjectScopeInternalContext';

type MetadataObjectScopeProps = {
  children: ReactNode;
  metadataObjectNamePlural: string;
};

export const MetadataObjectScope = ({
  children,
  metadataObjectNamePlural,
}: MetadataObjectScopeProps) => {
  return (
    <MetadataObjectScopeInternalContext.Provider
      value={{
        scopeId: metadataObjectNamePlural,
        objectNamePlural: metadataObjectNamePlural,
      }}
    >
      {children}
    </MetadataObjectScopeInternalContext.Provider>
  );
};
