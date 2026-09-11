import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';

const getActionLine = (instructions: string): string =>
  instructions.split('\n').find((line) => line.includes('ACTION:')) ?? '';

describe('buildMcpServerInstructions', () => {
  it('should render the ACTION line from the tools the caller can reach', () => {
    const instructions = buildMcpServerInstructions({
      objectNames: 'companies, people',
      actionToolNames: ['send_email', 'search_help_center'],
    });

    expect(getActionLine(instructions)).toContain(
      'send_email | search_help_center',
    );
    expect(instructions).not.toContain('create_file_upload');
    expect(instructions).not.toContain('http_request');
  });

  it('should add the upload recipe only when the upload tools are reachable', () => {
    const withUpload = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['create_file_upload', 'complete_file_upload'],
    });

    expect(withUpload).toContain('To attach a file: create_file_upload');

    const withoutUpload = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['send_email'],
    });

    expect(withoutUpload).not.toContain('To attach a file');
  });

  it('should add the http_request guidance only when http_request is reachable', () => {
    const withHttp = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['http_request'],
    });

    expect(withHttp).toContain('http_request is ONLY for external');

    const withoutHttp = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['send_email'],
    });

    expect(withoutHttp).not.toContain('http_request is ONLY for external');
  });

  it('should omit the skills line when the workspace has no skills', () => {
    const instructions = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['send_email'],
    });

    expect(instructions).not.toContain('Available skills');
  });
});
