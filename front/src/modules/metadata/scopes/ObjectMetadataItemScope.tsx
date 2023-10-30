import { ReactNode } from 'react';

import { ObjectMetadataItemScopeInternalContext } from './scope-internal-context/ObjectMetadataItemScopeInternalContext';

type ObjectMetadataItemScopeProps = {
  children: ReactNode;
  ObjectMetadataItemNamePlural: string;
};

export const ObjectMetadataItemScope = ({
  children,
  ObjectMetadataItemNamePlural,
}: ObjectMetadataItemScopeProps) => {
  return (
    <ObjectMetadataItemScopeInternalContext.Provider
      value={{
        scopeId: ObjectMetadataItemNamePlural,
        objectNamePlural: ObjectMetadataItemNamePlural,
      }}
    >
      {children}
    </ObjectMetadataItemScopeInternalContext.Provider>
  );
};
