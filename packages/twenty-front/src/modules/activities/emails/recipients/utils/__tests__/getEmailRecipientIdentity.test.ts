import { getEmailRecipientIdentity } from '@/activities/emails/recipients/utils/getEmailRecipientIdentity';

const person = {
  id: 'person-id',
  name: { firstName: 'Jane', lastName: 'Doe' },
  avatarUrl: 'https://example.com/jane.png',
  emails: { primaryEmail: 'jane@example.com' },
};

const namelessPerson = {
  ...person,
  name: { firstName: '', lastName: '' },
};

const workspaceMember = {
  id: 'member-id',
  name: { firstName: 'John', lastName: 'Smith' },
  avatarUrl: null,
};

describe('getEmailRecipientIdentity', () => {
  it('should use the person name and record when a person is resolved', () => {
    expect(
      getEmailRecipientIdentity({
        recipient: { address: 'jane@example.com' },
        resolution: { person },
      }),
    ).toEqual({
      kind: 'person',
      label: 'Jane Doe',
      resolvedRecord: {
        id: 'person-id',
        avatarUrl: 'https://example.com/jane.png',
      },
    });
  });

  it('should use the workspace member name when a member is resolved', () => {
    expect(
      getEmailRecipientIdentity({
        recipient: { address: 'john@example.com' },
        resolution: { workspaceMember },
      }),
    ).toEqual({
      kind: 'workspaceMember',
      label: 'John Smith',
      resolvedRecord: { id: 'member-id', avatarUrl: undefined },
    });
  });

  it('should prefer the person over the workspace member when both are resolved', () => {
    const identity = getEmailRecipientIdentity({
      recipient: { address: 'jane@example.com' },
      resolution: { person, workspaceMember },
    });

    expect(identity.label).toBe('Jane Doe');
    expect(identity.kind).toBe('person');
  });

  it('should fall back to the typed display name when the resolved record has no name', () => {
    const identity = getEmailRecipientIdentity({
      recipient: { address: 'jane@example.com', displayName: 'Typed Name' },
      resolution: { person: namelessPerson },
    });

    expect(identity.label).toBe('Typed Name');
    expect(identity.kind).toBe('person');
  });

  it('should fall back to the address when nothing else is available', () => {
    expect(
      getEmailRecipientIdentity({
        recipient: { address: 'someone@example.com' },
      }),
    ).toEqual({ kind: 'unknown', label: 'someone@example.com' });
  });

  it('should use the typed display name for an unresolved recipient', () => {
    expect(
      getEmailRecipientIdentity({
        recipient: { address: 'someone@example.com', displayName: 'Someone' },
      }),
    ).toEqual({ kind: 'unknown', label: 'Someone' });
  });
});
