import { createContext, RefObject, useRef } from 'react';

export const ObjectsTableWrapperContext = createContext<
  RefObject<HTMLTableElement>
>({
  current: null,
});

export type ObjectsTableWrapperProps = {
  children: React.ReactNode;
};

export const ObjectsTableWrapper = ({ children }: ObjectsTableWrapperProps) => {
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <ObjectsTableWrapperContext.Provider value={tableRef}>
      {children}
    </ObjectsTableWrapperContext.Provider>
  );
};
