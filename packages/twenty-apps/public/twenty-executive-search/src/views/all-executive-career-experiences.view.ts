import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-shared/types';
import { EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER } from '../objects/executive-career-experience.object';

export const EXECUTIVE_CAREER_EXPERIENCE_VIEW_ID =
  '9699fd17-9831-4f3f-8fbe-6bcc42065abd';

export default defineView({
  universalIdentifier: EXECUTIVE_CAREER_EXPERIENCE_VIEW_ID,
  name: 'All Career Experiences',
  objectUniversalIdentifier: EXECUTIVE_CAREER_EXPERIENCE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBriefcase',
  position: 0,
  fields: [],
});
