import { type SLACK_MEMBER_PROVENANCE } from 'src/logic-functions/constants/slack-member-provenance';

export type SlackMemberProvenance =
  (typeof SLACK_MEMBER_PROVENANCE)[keyof typeof SLACK_MEMBER_PROVENANCE];
