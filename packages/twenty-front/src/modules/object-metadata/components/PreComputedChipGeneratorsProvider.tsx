import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordChipGenerators } from '@/object-record/utils/getRecordChipGenerators';

export const PreComputedChipGeneratorsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { chipGeneratorPerObjectPerField, identifierChipGeneratorPerObject } =
    useMemo(() => {
      return getRecordChipGenerators(objectMetadataItems);
    }, [objectMetadataItems]);

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
