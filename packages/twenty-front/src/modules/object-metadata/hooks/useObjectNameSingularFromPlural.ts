import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { isDefined } from '~/utils/isDefined';

export const useObjectNameSingularFromPlural = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const onboardingStatus = useOnboardingStatus();
  const mockObjectMetadataItems = getObjectMetadataItemsMock();

  let objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: objectNamePlural,
      objectNameType: 'plural',
    }),
  );

  if (onboardingStatus !== OnboardingStatus.Completed) {
    objectMetadataItem =
      mockObjectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.namePlural === objectNamePlural,
      ) ?? null;
  }

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item not found for ${objectNamePlural} object`,
    );
  }

  return { objectNameSingular: objectMetadataItem.nameSingular };
};
