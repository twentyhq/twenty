import { FieldType, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_PRE_REVIEW_VERDICT_FIELD_ID =
  '8e579dd2-8c96-485a-a801-527ad87d6e14';

export default defineField({
  universalIdentifier: PARTNER_PRE_REVIEW_VERDICT_FIELD_ID,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.SELECT,
  name: 'preReviewVerdict',
  label: 'Pre-review Verdict',
  description:
    'Automated pre-review grade. Empty means the pre-review did not run.',
  icon: 'IconGavel',
  isNullable: true,
  options: [
    {
      id: '56725f73-9c2e-490a-800d-215d94fc7f32',
      value: 'STRONG',
      label: 'Strong',
      position: 0,
      color: 'green',
    },
    {
      id: '89d4fd7b-d208-417b-a9f4-00b5a80843d9',
      value: 'WORTH_A_LOOK',
      label: 'Worth a look',
      position: 1,
      color: 'blue',
    },
    {
      id: '9680353a-7cec-46e6-a341-d50cd9952b79',
      value: 'WEAK',
      label: 'Weak',
      position: 2,
      color: 'orange',
    },
    {
      id: '84f88287-1531-4318-ad7c-0e43528dc671',
      value: 'SPAM',
      label: 'Spam',
      position: 3,
      color: 'red',
    },
  ],
});
