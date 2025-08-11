import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

export const getMockObjectMetadataItemOrThrow = (
  nameSingular: string,
): ObjectMetadataItem => {
  const objectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === nameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item with name singular ${nameSingular} not found`,
    );
  }

  return objectMetadataItem;
};
