import { type Company } from '@/companies/types/Company';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getImageIdentifierFieldValue } from './getImageIdentifierFieldValue';
import {
  getImageAbsoluteURI,
  getLogoUrlFromDomainName,
  isDefined,
} from 'twenty-shared/utils';

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
      ? getImageAbsoluteURI({
          imageUrl: record.avatarUrl,
          baseUrl: REACT_APP_SERVER_BASE_URL,
        })
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
