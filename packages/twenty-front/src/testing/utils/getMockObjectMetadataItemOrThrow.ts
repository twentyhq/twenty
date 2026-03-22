import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { generateTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/generateTestEnrichedObjectMetadataItemsMock';

export const getMockObjectMetadataItemOrThrow = (
  nameSingular: string,
): EnrichedObjectMetadataItem => {
  const objectMetadataItem = generateTestEnrichedObjectMetadataItemsMock.find(
    (item) => item.nameSingular === nameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      `Object metadata item with name singular ${nameSingular} not found`,
    );
  }

  return objectMetadataItem;
};
