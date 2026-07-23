import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

import { ensurePartnerRole } from './ensure-partner-role.service';

describe('ensurePartnerRole', () => {
  const query = vi.fn();
  const mutation = vi.fn();
  const client = { query, mutation } as unknown as MetadataApiClient;

  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    mutation.mockResolvedValue({});
  });

  it('assigns the Partner role when the member lacks it', async () => {
    query.mockResolvedValueOnce({
      getRoles: [
        { id: 'role-partner', label: 'Partner', workspaceMembers: [{ id: 'other' }] },
        { id: 'role-admin', label: 'Admin', workspaceMembers: [{ id: 'member-1' }] },
      ],
    });
    const result = await ensurePartnerRole(client, 'member-1');
    expect(result).toEqual({ roleOk: true, assigned: true });
    expect(mutation).toHaveBeenCalledWith({
      updateWorkspaceMemberRole: { __args: { workspaceMemberId: 'member-1', roleId: 'role-partner' }, id: true },
    });
  });

  it('no-ops when the member already holds the Partner role', async () => {
    query.mockResolvedValueOnce({
      getRoles: [{ id: 'role-partner', label: 'Partner', workspaceMembers: [{ id: 'member-1' }] }],
    });
    const result = await ensurePartnerRole(client, 'member-1');
    expect(result).toEqual({ roleOk: true, assigned: false });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('reports partner_role_not_found when no Partner role exists', async () => {
    query.mockResolvedValueOnce({ getRoles: [{ id: 'role-admin', label: 'Admin', workspaceMembers: [] }] });
    const result = await ensurePartnerRole(client, 'member-1');
    expect(result).toEqual({ roleOk: false, reason: 'partner_role_not_found' });
    expect(mutation).not.toHaveBeenCalled();
  });
});
