import { linksCompositeType } from 'twenty-shared/types';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

const DOMAIN_NAME_FIELD_NAME = 'domainName';

const compositeProperty = (name: string) => {
  const property = linksCompositeType.properties.find(
    (candidate) => candidate.name === name,
  );

  if (!property) {
    throw new Error(`Links composite type has no ${name} property`);
  }

  return property;
};

export const COMPANY_DOMAIN_NAME_COLUMNS = {
  primaryLinkUrl: computeCompositeColumnName(
    DOMAIN_NAME_FIELD_NAME,
    compositeProperty('primaryLinkUrl'),
  ),
  secondaryLinks: computeCompositeColumnName(
    DOMAIN_NAME_FIELD_NAME,
    compositeProperty('secondaryLinks'),
  ),
};
