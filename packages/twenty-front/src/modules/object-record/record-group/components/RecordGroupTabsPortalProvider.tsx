import { RecordGroupTabsPortalContext } from '@/object-record/record-group/states/context/RecordGroupTabsPortalContext';
import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';

// Lets the tab row shrink to its container so overflow tabs can be measured
const StyledRecordGroupTabsPortal = styled.div`
  min-width: 0;
`;

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
      <StyledRecordGroupTabsPortal ref={setRecordGroupTabsPortalElement} />
      {children}
    </RecordGroupTabsPortalContext.Provider>
  );
};
