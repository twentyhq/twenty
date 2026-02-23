import React from 'react';

import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  return (
    <PreComputedChipGeneratorsProvider>
      {children}
    </PreComputedChipGeneratorsProvider>
  );
};
