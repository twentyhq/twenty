import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER } from '../objects/executive-education.object';

export const EXECUTIVE_EDUCATION_VIEW_ID =
  '43cb0a2f-f61e-436b-8558-3b291b53e67b';

export default defineView({
  universalIdentifier: EXECUTIVE_EDUCATION_VIEW_ID,
  name: 'All Educations',
  objectUniversalIdentifier: EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconSchool',
  position: 0,
  fields: [],
});
