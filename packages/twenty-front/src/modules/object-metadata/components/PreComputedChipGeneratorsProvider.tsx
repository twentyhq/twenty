import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordChipGenerators } from '@/object-record/utils/getRecordChipGenerators';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';

export const PreComputedChipGeneratorsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const allowRequestsToTwentyIcons = useRecoilValue(
    allowRequestsToTwentyIconsState,
  );
  const { chipGeneratorPerObjectPerField, identifierChipGeneratorPerObject } =
    useMemo(() => {
      return getRecordChipGenerators(
        objectMetadataItems,
        allowRequestsToTwentyIcons,
      );
    }, [allowRequestsToTwentyIcons, objectMetadataItems]);

  return (
    <>
      <PreComputedChipGeneratorsContext.Provider
        value={{
          chipGeneratorPerObjectPerField,
          identifierChipGeneratorPerObject,
        }}
      >
        {children}
      </PreComputedChipGeneratorsContext.Provider>
    </>
  );
};
