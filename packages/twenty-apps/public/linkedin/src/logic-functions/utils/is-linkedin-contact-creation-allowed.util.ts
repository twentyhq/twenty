import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';

export const isLinkedinContactCreationAllowed = ({
  policy,
  hasUserSentMessage,
}: {
  policy: LinkedinContactAutoCreationPolicy;
  hasUserSentMessage: boolean;
}): boolean =>
  policy === 'SENT_AND_RECEIVED' || (policy === 'SENT' && hasUserSentMessage);
