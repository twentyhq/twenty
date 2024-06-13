import { useMemo } from 'react';
import { Decorator } from '@storybook/react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/context/PreComputedChipGeneratorsContext';
import { getRecordChipGeneratorPerObjectPerField } from '@/object-record/utils/getRecordChipGeneratorPerObjectPerField';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/objectMetadataItems';

export const ChipGeneratorsDecorator: Decorator = (Story) => {
  const chipGeneratorPerObjectPerField = useMemo(() => {
    return getRecordChipGeneratorPerObjectPerField(
      generatedMockObjectMetadataItems,
    );
  }, []);

  return (
    <PreComputedChipGeneratorsContext.Provider
      value={{
        chipGeneratorPerObjectPerField,
      }}
    >
      <Story />
    </PreComputedChipGeneratorsContext.Provider>
  );
};
