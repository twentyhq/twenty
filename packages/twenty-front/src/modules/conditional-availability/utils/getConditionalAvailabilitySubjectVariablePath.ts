import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { doNotTranslate } from 'twenty-shared/i18n';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilitySubjectVariablePath = ({
  subject,
}: {
  subject: ConditionalAvailabilitySubject;
}): string => {
  switch (subject) {
    case 'role':
      return doNotTranslate('currentRole.universalIdentifier');
    case 'workspaceMember':
      return doNotTranslate('currentWorkspaceMember.id');
    case 'device':
      return doNotTranslate('device');
    default:
      return assertUnreachable(subject);
  }
};
