import { LIST_OBJECT_METADATA_NAMES_TOOL_NAME } from 'src/engine/api/mcp/tools/list-object-metadata-names.tool';
import { LIST_SKILLS_TOOL_NAME } from 'src/engine/api/mcp/tools/list-skills.tool';
import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
  LOAD_SKILL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { GET_TOOL_CATALOG_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools/get-tool-catalog.tool';

const getActionLine = (instructions: string): string =>
  instructions.split('\n').find((line) => line.includes('ACTION:')) ?? '';

describe('buildMcpServerInstructions', () => {
  it('should render the ACTION line from the tools the caller can reach', () => {
    const instructions = buildMcpServerInstructions({
      objectNames: 'companies, people',
      toolNamesByCategory: { ACTION: ['send_email', 'search_help_center'] },
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
      toolNamesByCategory: {
        ACTION: ['create_file_upload', 'complete_file_upload'],
      },
    });

    expect(withUpload).toContain('To attach a file: create_file_upload');

    const withoutUpload = buildMcpServerInstructions({
      objectNames: 'companies',
      toolNamesByCategory: { ACTION: ['send_email'] },
    });

    expect(withoutUpload).not.toContain('To attach a file');
  });

  it('should add the http_request guidance only when http_request is reachable', () => {
    const withHttp = buildMcpServerInstructions({
      objectNames: 'companies',
      toolNamesByCategory: { ACTION: ['http_request'] },
    });

    expect(withHttp).toContain('http_request is ONLY for external');

    const withoutHttp = buildMcpServerInstructions({
      objectNames: 'companies',
      toolNamesByCategory: { ACTION: ['send_email'] },
    });

    expect(withoutHttp).not.toContain('http_request is ONLY for external');
  });

  it('should document every meta-tool the MCP server exposes', () => {
    const instructions = buildMcpServerInstructions({
      objectNames: 'companies',
      toolNamesByCategory: { ACTION: ['send_email'] },
    });

    for (const toolName of [
      EXECUTE_TOOL_TOOL_NAME,
      LEARN_TOOLS_TOOL_NAME,
      LOAD_SKILL_TOOL_NAME,
      LIST_OBJECT_METADATA_NAMES_TOOL_NAME,
      LIST_SKILLS_TOOL_NAME,
      GET_TOOL_CATALOG_TOOL_NAME,
    ]) {
      expect(instructions).toContain(toolName);
    }
  });

  it('should route an unverified tool name to learn_tools, not to the catalog', () => {
    const instructions = buildMcpServerInstructions({
      objectNames: 'companies',
      toolNamesByCategory: { ACTION: ['send_email'] },
    });

    expect(instructions).toContain(
      'unknown names come back under notFound with the closest matching names',
    );
    expect(instructions).toContain(
      `Never call ${GET_TOOL_CATALOG_TOOL_NAME} just to check a name`,
    );
    expect(instructions).toContain(
      `${GET_TOOL_CATALOG_TOOL_NAME} with ONE category`,
    );
  });

  it('should omit the skills line when the workspace has no skills', () => {
    const instructions = buildMcpServerInstructions({
      objectNames: 'companies',
      toolNamesByCategory: { ACTION: ['send_email'] },
    });

    expect(instructions).not.toContain('Available skills');
  });
});
