import { type Company } from '@/companies/types/Company';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import {
  getImageAbsoluteURI,
  getLogoUrlFromDomainName,
  isDefined,
} from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getImageIdentifierFieldValue } from './getImageIdentifierFieldValue';

export const getAvatarUrl = (
  objectNameSingular: string,
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
  allowRequestsToTwentyIcons?: boolean | undefined,
  isFilesFieldMigrated?: boolean | undefined,
) => {
  if (objectNameSingular === CoreObjectNameSingular.WorkspaceMember) {
    return record.avatarUrl ?? undefined;
  }

  if (
    objectNameSingular === CoreObjectNameSingular.Company &&
    allowRequestsToTwentyIcons === true
  ) {
    return getLogoUrlFromDomainName(
      getCompanyDomainName(record as Company) ?? '',
    );
  }

  if (objectNameSingular === CoreObjectNameSingular.Person) {
    if (isFilesFieldMigrated === true) {
      return record.avatarFile?.[0]?.url ?? '';
    }

    return isNonEmptyString(record.avatarUrl)
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
