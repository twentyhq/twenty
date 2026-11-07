import { RecordGroupTabsPortalContext } from '@/object-record/record-group/states/context/RecordGroupTabsPortalContext';
import { type ReactNode, useState } from 'react';

type RecordGroupTabsPortalProviderProps = {
  children: ReactNode;
};

export const RecordGroupTabsPortalProvider = ({
  children,
}: RecordGroupTabsPortalProviderProps) => {
  const [recordGroupTabsPortalElement, setRecordGroupTabsPortalElement] =
    useState<HTMLDivElement | null>(null);

  return (
    <RecordGroupTabsPortalContext.Provider value={recordGroupTabsPortalElement}>
      <div ref={setRecordGroupTabsPortalElement} />
      {children}
    </RecordGroupTabsPortalContext.Provider>
  );
};
