import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { formatMetadataFieldAsColumnDefinition } from '../utils/formatMetadataFieldAsColumnDefinition';

import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

export const useFindOneMetadataObject = ({
  objectNamePlural,
}: MetadataObjectIdentifier) => {
  const { metadataObjects } = useFindManyMetadataObjects();

  const foundMetadataObject = metadataObjects.find(
    (object) => object.namePlural === objectNamePlural,
  );

  const objectNotFoundInMetadata =
    metadataObjects.length > 0 && !foundMetadataObject;

  const tempColumnDefinitions: ColumnDefinition<FieldMetadata>[] =
    foundMetadataObject?.fields.map((field, index) =>
      formatMetadataFieldAsColumnDefinition({
        index,
        field,
      }),
    ) ?? [];

  return {
    foundMetadataObject,
    objectNotFoundInMetadata,
    tempColumnDefinitions,
  };
};
