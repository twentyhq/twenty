import { getLinkFaviconUrl } from '@/navigation-menu-item/display/link/utils/getLinkFaviconUrl';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type FieldFilesValue,
  type FieldLinksValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
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
      const files = fieldValue as FieldFilesValue[];

      return files[0]?.url ?? null;
    }
    case FieldMetadataType.LINKS: {
      if (allowRequestsToTwentyIcons !== true) {
        return null;
      }

      const links = fieldValue as FieldLinksValue;

      return isDefined(links.primaryLinkUrl)
        ? (getLinkFaviconUrl(links.primaryLinkUrl) ?? null)
        : null;
    }
    default:
      return fieldValue as string;
  }
};
