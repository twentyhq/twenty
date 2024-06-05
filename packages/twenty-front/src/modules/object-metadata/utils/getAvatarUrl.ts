import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getLogoUrlFromDomainName } from '~/utils';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';
import { isDefined } from '~/utils/isDefined';

import { getImageIdentifierFieldValue } from './getImageIdentifierFieldValue';

export const getAvatarUrl = (
  objectNameSingular: string,
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return record.avatarUrl ?? undefined;
  }

  if (objectNameSingular === CoreObjectNameSingular.Company) {
    return getLogoUrlFromDomainName(record.domainName ?? '');
  }

  if (objectNameSingular === CoreObjectNameSingular.Person) {
    return getImageAbsoluteURIOrBase64(record.avatarUrl) ?? '';
  }

  const imageIdentifierFieldValue = getImageIdentifierFieldValue(
    record,
    imageIdentifierFieldMetadataItem,
  );

  if (isDefined(imageIdentifierFieldValue)) {
    return imageIdentifierFieldValue;
  }

  return '';
};
