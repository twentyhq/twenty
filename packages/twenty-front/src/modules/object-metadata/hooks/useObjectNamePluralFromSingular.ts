import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { isDefined } from '~/utils/isDefined';

export const useObjectNamePluralFromSingular = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const onboardingStatus = useOnboardingStatus();
  const mockObjectMetadataItems = getObjectMetadataItemsMock();

  let objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: objectNameSingular,
      objectNameType: 'singular',
    }),
  );

  if (onboardingStatus !== OnboardingStatus.Completed) {
    objectMetadataItem =
      mockObjectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === objectNameSingular,
      ) ?? null;
  }

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item not found for ${objectNameSingular} object`,
    );
  }

  return { objectNamePlural: objectMetadataItem.namePlural };
};
