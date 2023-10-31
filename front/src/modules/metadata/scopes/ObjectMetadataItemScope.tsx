import { ReactNode } from 'react';

import { ObjectMetadataItemScopeInternalContext } from './scope-internal-context/ObjectMetadataItemScopeInternalContext';

type ObjectMetadataItemScopeProps = {
  children: ReactNode;
  objectMetadataItemNamePlural: string;
};

export const ObjectMetadataItemScope = ({
  children,
  objectMetadataItemNamePlural,
}: ObjectMetadataItemScopeProps) => {
  return (
    <ObjectMetadataItemScopeInternalContext.Provider
      value={{
        scopeId: objectMetadataItemNamePlural,
        objectNamePlural: objectMetadataItemNamePlural,
      }}
    >
      {children}
    </ObjectMetadataItemScopeInternalContext.Provider>
  );
};
