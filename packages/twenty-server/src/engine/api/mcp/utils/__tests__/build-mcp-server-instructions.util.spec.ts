import { LIST_OBJECT_METADATA_NAMES_TOOL_NAME } from 'src/engine/api/mcp/tools/list-object-metadata-names.tool';
import { LIST_SKILLS_TOOL_NAME } from 'src/engine/api/mcp/tools/list-skills.tool';
import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
  LOAD_SKILL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { GET_TOOL_CATALOG_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools/get-tool-catalog.tool';

const COMPANY = { nameSingular: 'company', namePlural: 'companies' };
const PERSON = { nameSingular: 'person', namePlural: 'people' };

const getLine = (instructions: string, marker: string): string =>
  instructions.split('\n').find((line) => line.includes(marker)) ?? '';

const getActionLine = (instructions: string): string =>
  getLine(instructions, 'ACTION:');

describe('buildMcpServerInstructions', () => {
  it('should render the ACTION line from the tools the caller can reach', () => {
    const instructions = buildMcpServerInstructions({
      objects: [COMPANY, PERSON],
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
      objects: [COMPANY],
      actionToolNames: ['create_file_upload', 'complete_file_upload'],
    });

    expect(withUpload).toContain('To attach a file: create_file_upload');

    const withoutUpload = buildMcpServerInstructions({
      objects: [COMPANY],
      actionToolNames: ['send_email'],
    });

    expect(withoutUpload).not.toContain('To attach a file');
  });

  it('should add the http_request guidance only when http_request is reachable', () => {
    const withHttp = buildMcpServerInstructions({
      objects: [COMPANY],
      actionToolNames: ['http_request'],
    });

    expect(withHttp).toContain('http_request is ONLY for external');

    const withoutHttp = buildMcpServerInstructions({
      objects: [COMPANY],
      actionToolNames: ['send_email'],
    });

    expect(withoutHttp).not.toContain('http_request is ONLY for external');
  });

  it('should document every meta-tool the MCP server exposes', () => {
    const instructions = buildMcpServerInstructions({
      objects: [COMPANY],
      actionToolNames: ['send_email'],
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
      objects: [COMPANY],
      actionToolNames: ['send_email'],
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
      objects: [COMPANY],
      actionToolNames: ['send_email'],
    });

    expect(instructions).not.toContain('Available skills');
  });

  it('should pair only the objects whose plural is not the singular plus "s"', () => {
    const instructions = buildMcpServerInstructions({
      objects: [
        COMPANY,
        { nameSingular: 'equipment', namePlural: 'equipment' },
        { nameSingular: 'note', namePlural: 'notes' },
        { nameSingular: 'note_target', namePlural: 'note_targets' },
        PERSON,
      ],
      actionToolNames: [],
    });

    expect(getLine(instructions, 'Available objects')).toBe(
      'Available objects (plural is +s unless shown as singular/plural): company/companies, equipment/equipment, note, note_target, person/people.',
    );
  });

  it('should advertise query search on get_tool_catalog', () => {
    const instructions = buildMcpServerInstructions({
      objects: [COMPANY],
      actionToolNames: [],
    });

    const catalogLine = getLine(instructions, 'get_tool_catalog(');

    expect(catalogLine).toContain('get_tool_catalog(query, categories)');
    expect(catalogLine).toContain('Pass a short query or ONE category');
    expect(catalogLine.indexOf('—')).toBe(
      getLine(instructions, 'execute_tool(').indexOf('—'),
    );
    expect(getLine(instructions, "Don't know which tool exists")).toContain(
      'or a short query',
    );
  });

  it('should point logic function discovery to the catalog', () => {
    const instructions = buildMcpServerInstructions({
      objects: [COMPANY],
      actionToolNames: [],
    });

    expect(getLine(instructions, 'LOGIC_FUNCTION:')).toContain(
      "get_tool_catalog with categories: ['LOGIC_FUNCTION']",
    );
    expect(instructions).not.toContain('list_logic_function_tools');
  });
});
