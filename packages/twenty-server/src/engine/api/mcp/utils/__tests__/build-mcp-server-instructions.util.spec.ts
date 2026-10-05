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
      actionToolNames: ['send_email', 'search_help_center'],
      isDirectMode: false,
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
      isDirectMode: false,
    });

    expect(withUpload).toContain('To attach a file: create_file_upload');

    const withoutUpload = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['send_email'],
      isDirectMode: false,
    });

    expect(withoutUpload).not.toContain('To attach a file');
  });

  it('should add the http_request guidance only when http_request is reachable', () => {
    const withHttp = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['http_request'],
      isDirectMode: false,
    });

    expect(withHttp).toContain('http_request is ONLY for external');

    const withoutHttp = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['send_email'],
      isDirectMode: false,
    });

    expect(withoutHttp).not.toContain('http_request is ONLY for external');
  });

  it('should document every meta-tool the MCP server exposes', () => {
    const instructions = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['send_email'],
      isDirectMode: false,
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
      actionToolNames: ['send_email'],
      isDirectMode: false,
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
      actionToolNames: ['send_email'],
      isDirectMode: false,
    });

    expect(instructions).not.toContain('Available skills');
  });

  it('should point direct mode at the listed tools instead of the meta-tools', () => {
    const directInstructions = buildMcpServerInstructions({
      objectNames: 'companies',
      actionToolNames: ['send_email'],
      isDirectMode: true,
    });

    for (const toolName of [
      EXECUTE_TOOL_TOOL_NAME,
      LEARN_TOOLS_TOOL_NAME,
      GET_TOOL_CATALOG_TOOL_NAME,
    ]) {
      expect(directInstructions).not.toContain(toolName);
    }

    expect(directInstructions).toContain(
      'Tools for objects or app functions created during this session only appear after reconnecting',
    );
  });
});
