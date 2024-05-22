import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

type ObjectFieldRowProps = {
  field: FieldMetadataItem;
  type: 'from' | 'to';
};

export const ObjectFieldRow = ({ field, type }: ObjectFieldRowProps) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { getIcon } = useIcons();
  const theme = useTheme();

  const relatedObjectId =
    type === 'from'
      ? field.toRelationMetadata?.fromObjectMetadata.id
      : field.fromRelationMetadata?.toObjectMetadata.id;
  const relatedObject = objectMetadataItems.find(
    (x) => x.id === relatedObjectId,
  );

  const Icon = getIcon(relatedObject?.icon);

  return (
    <>
      {Icon && <Icon size={theme.icon.size.md} />}
      {capitalize(relatedObject?.namePlural ?? '')}
    </>
  );
};
