import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { LOCATION_CONTINENT_OPTIONS } from 'src/constants/location-continent-options';
import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { buildSelectOptions } from 'src/utils/build-select-options';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlLocationContinent,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlLocationContinent',
  label: 'Continent',
  description: 'People Data Labs canonical continent.',
  icon: 'IconGlobe',
  isNullable: true,
  options: buildSelectOptions({
    meta: LOCATION_CONTINENT_OPTIONS,
    ids: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyLocationContinent,
  }),
});
