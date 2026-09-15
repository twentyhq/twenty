import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { ENRICHMENT_STATUS_OPTIONS } from 'src/constants/enrichment-status-options';
import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { buildSelectOptions } from 'src/utils/build-select-options';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlEnrichmentStatus,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlEnrichmentStatus',
  label: 'Enrichment Status',
  description: 'Outcome of the latest People Data Labs enrichment attempt.',
  icon: 'IconProgressCheck',
  isNullable: true,
  options: buildSelectOptions({
    meta: ENRICHMENT_STATUS_OPTIONS,
    ids: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personEnrichmentStatus,
  }),
});
