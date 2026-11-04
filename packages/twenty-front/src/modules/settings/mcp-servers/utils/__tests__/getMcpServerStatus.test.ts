import { getMcpServerStatus } from '@/settings/mcp-servers/utils/getMcpServerStatus';

describe('getMcpServerStatus', () => {
  it('reports an inactive server before anything else', () => {
    expect(
      getMcpServerStatus({
        isActive: false,
        toolsSyncError: 'Connection refused',
        tools: [{}, {}],
      }),
    ).toEqual({ color: 'gray', label: 'Inactive' });
  });

  it('reports a sync error on an active server', () => {
    expect(
      getMcpServerStatus({
        isActive: true,
        toolsSyncError: 'Connection refused',
        tools: [],
      }),
    ).toEqual({ color: 'red', label: 'Sync failed' });
  });

  it('counts the cached tools', () => {
    expect(
      getMcpServerStatus({ isActive: true, toolsSyncError: null, tools: [{}] }),
    ).toEqual({ color: 'green', label: '1 tool' });
    expect(
      getMcpServerStatus({
        isActive: true,
        toolsSyncError: null,
        tools: [{}, {}, {}],
      }),
    ).toEqual({ color: 'green', label: '3 tools' });
  });

  it('greys out a server with no cached tools', () => {
    expect(
      getMcpServerStatus({ isActive: true, toolsSyncError: null, tools: [] }),
    ).toEqual({ color: 'gray', label: '0 tools' });
  });
});
