import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { MCP_SERVER_NAME_PATTERN } from '@/sdk/define/common/constants/mcp-server-name-pattern.constant';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import {
  type McpServerManifest,
  normalizeMcpServerManifest,
  withDeprecatedMcpServerReferences,
} from 'twenty-shared/application';
import { isDefined, isHttpUrl, isNonEmptyString } from 'twenty-shared/utils';

export const defineMcpServer: DefineEntity<McpServerManifest> = (config) => {
  const errors: string[] = [];

  if (!isNonEmptyString(config.universalIdentifier)) {
    errors.push('MCP server must have a universalIdentifier');
  } else if (!isValidPostgresUuid(config.universalIdentifier)) {
    errors.push(
      `MCP server universalIdentifier "${config.universalIdentifier}" must be a UUID. Generate one with \`uuidgen\` or any UUID v4 tool.`,
    );
  }

  if (!isNonEmptyString(config.name)) {
    errors.push('MCP server must have a name');
  } else if (!MCP_SERVER_NAME_PATTERN.test(config.name)) {
    errors.push(
      `MCP server name "${config.name}" must match ${MCP_SERVER_NAME_PATTERN}`,
    );
  }

  if (!isNonEmptyString(config.label)) {
    errors.push('MCP server must have a label');
  }

  if (!isNonEmptyString(config.url) || !isHttpUrl(config.url)) {
    errors.push(`MCP server url "${config.url}" must be an HTTP or HTTPS URL`);
  }

  const normalizedConfig = normalizeMcpServerManifest(config);
  const { connectionProviderUniversalIdentifier } = normalizedConfig;

  if (
    isDefined(connectionProviderUniversalIdentifier) &&
    !isValidPostgresUuid(connectionProviderUniversalIdentifier)
  ) {
    errors.push(
      `MCP server connectionProviderUniversalIdentifier "${connectionProviderUniversalIdentifier}" must be the UUID universalIdentifier of a connection provider in this app.`,
    );
  }

  // Both spellings, so a manifest built by a CLI older than this SDK still reads on older servers.
  return createValidationResult({
    config: withDeprecatedMcpServerReferences(config),
    errors,
  });
};
