import { type Decorator } from '@storybook/react-vite';
import { useMemo } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { getRecordChipGenerators } from '@/object-record/utils/getRecordChipGenerators';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

export const ChipGeneratorsDecorator: Decorator = (Story) => {
  const { chipGeneratorPerObjectPerField, identifierChipGeneratorPerObject } =
    useMemo(() => {
      return getRecordChipGenerators(getTestEnrichedObjectMetadataItemsMock());
    }, []);

  return (
    <PreComputedChipGeneratorsContext.Provider
      value={{
        chipGeneratorPerObjectPerField,
        identifierChipGeneratorPerObject,
      }}
    >
      <Story />
    </PreComputedChipGeneratorsContext.Provider>
  );
};
