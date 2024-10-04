import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

import { getDisplayNameFromParticipant } from '../getDisplayNameFromParticipant';

describe('getDisplayNameFromParticipant', () => {
  const participantWithName: EmailThreadMessageParticipant = {
    id: '2cac0ba7-0e60-46c6-86e7-e5b0bc55b7cf',
    __typename: 'EmailThreadMessageParticipant',
    displayName: '',
    handle: '',
    role: 'from',
    messageId: '638f52d1-fd55-4a2b-b0f3-9858ea3b2e91',
    person: {
      __typename: 'Person',
      id: '1',
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
      avatarUrl: '',
      jobTitle: '',
      linkedinLink: {
        primaryLinkUrl: '',
        primaryLinkLabel: '',
      },
      xLink: {
        primaryLinkUrl: '',
        primaryLinkLabel: '',
      },
      city: '',
      email: '',
      phone: '',
      companyId: '',
    },
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '1',
      name: {
        firstName: 'Jane',
        lastName: 'Smith',
      },
      locale: '',
      createdAt: '',
      updatedAt: '',
      userEmail: '',
      userId: '',
    },
  };

  const participantWithHandle: any = {
    displayName: '',
    handle: 'user_handle',
    role: 'from',
  };

  const participantWithDisplayName: any = {
    displayName: 'User123',
    handle: '',
    role: 'from',
  };

  const participantWithoutInfo: any = {
    displayName: '',
    handle: '',
    role: 'from',
  };

  it('should return full name when shouldUseFullName is true', () => {
    expect(
      getDisplayNameFromParticipant({
        participant: participantWithName,
        shouldUseFullName: true,
      }),
    ).toBe('John Doe');
  });

  it('should return first name when shouldUseFullName is false', () => {
    expect(
      getDisplayNameFromParticipant({ participant: participantWithName }),
    ).toBe('John');
  });

  it('should return displayName if it is a non-empty string', () => {
    expect(
      getDisplayNameFromParticipant({
        participant: participantWithDisplayName,
      }),
    ).toBe('User123');
  });

  it('should return handle if displayName is not available', () => {
    expect(
      getDisplayNameFromParticipant({ participant: participantWithHandle }),
    ).toBe('user_handle');
  });

  it('should return Unknown if no suitable information is available', () => {
    expect(
      getDisplayNameFromParticipant({ participant: participantWithoutInfo }),
    ).toBe('Unknown');
  });
});
