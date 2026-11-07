import { v4 } from 'uuid';

export const buildAgentChatChannelRolesToCreate = ({
  channelUniversalIdentifier,
  roleUniversalIdentifiers,
  applicationUniversalIdentifier,
  now,
}: {
  channelUniversalIdentifier: string;
  roleUniversalIdentifiers: string[];
  applicationUniversalIdentifier: string;
  now: string;
}) =>
  roleUniversalIdentifiers.map((roleUniversalIdentifier) => ({
    id: v4(),
    universalIdentifier: v4(),
    channelUniversalIdentifier,
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
  }));
