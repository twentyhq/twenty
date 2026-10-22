import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import { type McpServerManifest } from 'twenty-shared/application';

// Prefixes every tool name offered to the AI chat, so it must stay a short tool-name-safe slug
const MCP_SERVER_NAME_PATTERN = /^[a-z][a-z0-9_]{0,31}$/;

const isHttpUrl = (url: string): boolean => {
  try {
    const { protocol } = new URL(url);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

export const defineMcpServer: DefineEntity<McpServerManifest> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('MCP server must have a universalIdentifier');
  } else if (!isValidPostgresUuid(config.universalIdentifier)) {
    errors.push(
      `MCP server universalIdentifier "${config.universalIdentifier}" must be a UUID. Generate one with \`uuidgen\` or any UUID v4 tool.`,
    );
  }

  if (!config.name) {
    errors.push('MCP server must have a name');
  } else if (!MCP_SERVER_NAME_PATTERN.test(config.name)) {
    errors.push(
      `MCP server name "${config.name}" must match ${MCP_SERVER_NAME_PATTERN} (it prefixes the tool names)`,
    );
  }

  if (!config.label) {
    errors.push('MCP server must have a label');
  }

  if (!config.url) {
    errors.push('MCP server must have a url');
  } else if (!isHttpUrl(config.url)) {
    errors.push(`MCP server url "${config.url}" must be an http(s) URL`);
  }

  return createValidationResult({ config, errors });
};
