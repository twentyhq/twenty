import { useRecoilCallback } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRelationMetadata } from '@/object-metadata/utils/getRelationMetadata';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useGetRelationMetadata = () =>
  useRecoilCallback(
    ({ snapshot }) =>
      ({ fieldMetadataItem }: { fieldMetadataItem: FieldMetadataItem }) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .valueOrThrow();

        return getRelationMetadata({
          fieldMetadataItem,
          objectMetadataItems,
        });
      },
    [],
  );
