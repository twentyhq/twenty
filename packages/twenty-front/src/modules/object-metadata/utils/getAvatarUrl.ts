import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getLogoUrlFromDomainName } from '~/utils';
import { isDefined } from '~/utils/isDefined';

import { Company } from '@/companies/types/Company';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { getImageAbsoluteURI } from 'twenty-ui';
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
    return getLogoUrlFromDomainName(
      getCompanyDomainName(record as Company) ?? '',
    );
  }

  if (objectNameSingular === CoreObjectNameSingular.Person) {
    return isDefined(record.avatarUrl)
      ? getImageAbsoluteURI(record.avatarUrl)
      : '';
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
