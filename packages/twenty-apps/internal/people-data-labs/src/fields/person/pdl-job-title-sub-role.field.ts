import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { JOB_TITLE_SUB_ROLE_OPTIONS } from 'src/constants/job-title-sub-role-options';
import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { buildSelectOptions } from 'src/utils/build-select-options';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlJobTitleSubRole,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlJobTitleSubRole',
  label: 'Job Sub-Role',
  description: 'People Data Labs canonical job sub-role.',
  icon: 'IconSubtask',
  isNullable: true,
  options: buildSelectOptions({
    meta: JOB_TITLE_SUB_ROLE_OPTIONS,
    ids: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobSubRole,
  }),
});
