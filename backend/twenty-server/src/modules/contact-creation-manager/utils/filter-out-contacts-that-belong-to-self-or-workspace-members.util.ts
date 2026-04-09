import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkDomain } from 'src/utils/is-work-email';

export function filterOutContactsThatBelongToSelfOrWorkspaceMembers(
  contacts: Contact[],
  connectedAccount: ConnectedAccountWorkspaceEntity,
  workspaceMembers: WorkspaceMemberWorkspaceEntity[],
): Contact[] {
  if (!isDefined(connectedAccount.handle)) {
    throw new Error('Connected account handle is missing');
  }
  const selfDomainName = getDomainNameFromHandle(
    connectedAccount.handle,
  ).toLowerCase();

  const allHandles = [
    connectedAccount.handle.toLowerCase(),
    ...(connectedAccount.handleAliases?.split(',') || []).map((handle) =>
      handle.toLowerCase(),
    ),
  ];

  const workspaceMembersMap = workspaceMembers.reduce(
    (map, workspaceMember) => {
      // @ts-expect-error legacy noImplicitAny
      map[workspaceMember.userEmail.toLowerCase()] = true;

      return map;
    },
    new Map<string, boolean>(),
  );

  const isDifferentDomain = (contact: Contact, selfDomainName: string) =>
    getDomainNameFromHandle(contact.handle).toLowerCase() !== selfDomainName;

  return contacts.filter(
    (contact) =>
      (isDifferentDomain(contact, selfDomainName) ||
        !isWorkDomain(selfDomainName)) &&
      // @ts-expect-error legacy noImplicitAny
      !workspaceMembersMap[contact.handle.toLowerCase()] &&
      !allHandles.includes(contact.handle.toLowerCase()),
  );
}
