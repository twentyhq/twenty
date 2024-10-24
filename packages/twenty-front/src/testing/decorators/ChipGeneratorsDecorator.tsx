import { Decorator } from '@storybook/react';
import { useMemo } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { getRecordChipGenerators } from '@/object-record/utils/getRecordChipGenerators';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

export const ChipGeneratorsDecorator: Decorator = (Story) => {
  const { chipGeneratorPerObjectPerField, identifierChipGeneratorPerObject } =
    useMemo(() => {
      return getRecordChipGenerators(generatedMockObjectMetadataItems);
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
