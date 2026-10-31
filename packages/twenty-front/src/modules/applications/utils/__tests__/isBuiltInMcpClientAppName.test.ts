import { isBuiltInMcpClientAppName } from '@/applications/utils/isBuiltInMcpClientAppName';

describe('isBuiltInMcpClientAppName', () => {
  it('recognizes the names of ChatGPT and Claude whatever the case', () => {
    expect(isBuiltInMcpClientAppName('Claude')).toBe(true);
    expect(isBuiltInMcpClientAppName(' chatgpt ')).toBe(true);
  });

  it('leaves other names alone, including other clients of the same vendors', () => {
    expect(isBuiltInMcpClientAppName('Claude Code')).toBe(false);
    expect(isBuiltInMcpClientAppName('Zapier')).toBe(false);
  });
});
