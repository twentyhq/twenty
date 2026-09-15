import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { getImageIdentifierFieldValue } from './getImageIdentifierFieldValue';

export const getAvatarUrl = (
  objectNameSingular: string,
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
  allowRequestsToTwentyIcons?: boolean | undefined,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return record.avatarUrl ?? undefined;
  }

  const imageIdentifierFieldValue = getImageIdentifierFieldValue(
    record,
    imageIdentifierFieldMetadataItem,
    allowRequestsToTwentyIcons,
  );

  if (isDefined(imageIdentifierFieldValue)) {
    return imageIdentifierFieldValue;
  }

  return '';
};
