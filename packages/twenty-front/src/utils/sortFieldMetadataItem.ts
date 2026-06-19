import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';

import { parseDate } from '~/utils/date-utils';

export const sortFieldMetadataItem = (
  a: FieldMetadataItem,
  b: FieldMetadataItem,
  workspaceCustomApplicationId?: string | null,
) => {
  const aIsCustom = getIsMetadataItemCustom(a, workspaceCustomApplicationId);
  const bIsCustom = getIsMetadataItemCustom(b, workspaceCustomApplicationId);

  const customCompare = aIsCustom === bIsCustom ? 0 : aIsCustom ? 1 : -1;
  if (customCompare !== 0) return customCompare;

  const dateA = a.createdAt ? parseDate(a.createdAt) : null;
  const dateB = b.createdAt ? parseDate(b.createdAt) : null;

  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;

  return dateB.getTime() - dateA.getTime() > 0 ? -1 : 1;
};
