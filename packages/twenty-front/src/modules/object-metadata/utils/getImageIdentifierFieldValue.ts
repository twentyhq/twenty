import { getLinkFaviconUrl } from '@/navigation-menu-item/display/link/utils/getLinkFaviconUrl';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldFilesValue } from '@/object-record/record-field/ui/types/guards/isFieldFilesValue';
import { isFieldLinksValue } from '@/object-record/record-field/ui/types/guards/isFieldLinksValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getImageIdentifierFieldValue = (
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
  allowRequestsToTwentyIcons?: boolean,
): string | null => {
  if (!isDefined(imageIdentifierFieldMetadataItem?.name)) {
    return null;
  }

  const fieldValue = record[imageIdentifierFieldMetadataItem.name];

  if (!isDefined(fieldValue)) {
    return null;
  }

  switch (imageIdentifierFieldMetadataItem.type) {
    case FieldMetadataType.FILES: {
      if (!isFieldFilesValue(fieldValue)) {
        return null;
      }

      return fieldValue[0]?.url ?? null;
    }
    case FieldMetadataType.LINKS: {
      if (
        allowRequestsToTwentyIcons !== true ||
        !isFieldLinksValue(fieldValue)
      ) {
        return null;
      }

      return isDefined(fieldValue.primaryLinkUrl)
        ? getLinkFaviconUrl(fieldValue.primaryLinkUrl)
        : null;
    }
    default:
      return null;
  }
};
