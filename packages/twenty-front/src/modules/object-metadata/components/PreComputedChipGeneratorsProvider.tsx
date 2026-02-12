import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordChipGenerators } from '@/object-record/utils/getRecordChipGenerators';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const PreComputedChipGeneratorsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const allowRequestsToTwentyIcons = useRecoilValue(
    allowRequestsToTwentyIconsState,
  );
  const isFilesFieldMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
  );
  const { chipGeneratorPerObjectPerField, identifierChipGeneratorPerObject } =
    useMemo(() => {
      return getRecordChipGenerators(
        objectMetadataItems,
        allowRequestsToTwentyIcons,
        isFilesFieldMigrated,
      );
    }, [allowRequestsToTwentyIcons, isFilesFieldMigrated, objectMetadataItems]);

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
