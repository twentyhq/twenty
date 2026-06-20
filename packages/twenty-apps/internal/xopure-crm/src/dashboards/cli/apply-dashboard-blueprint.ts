import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ambassadorCommandCenterBlueprint } from '../blueprints/ambassador-command-center.blueprint';
import type { DashboardBlueprint } from '../blueprints/dashboard-blueprint.type';
import { leadsAndCustomersBlueprint } from '../blueprints/leads-and-customers.blueprint';
import {
  applyDashboardBlueprint,
  type DashboardApplyApiConfig,
} from '../blueprints/apply-dashboard-blueprint';
import { opsCommandCenterBlueprint } from '../blueprints/ops-command-center.blueprint';
import { ordersDashboardBlueprint } from '../blueprints/orders-dashboard.blueprint';
import { paymentsDashboardBlueprint } from '../blueprints/payments-dashboard.blueprint';
import { fulfillmentDashboardBlueprint } from '../blueprints/fulfillment-dashboard.blueprint';
import { riskExceptionsDashboardBlueprint } from '../blueprints/risk-exceptions-dashboard.blueprint';
import { compIntegrityDashboardBlueprint } from '../blueprints/comp-integrity-dashboard.blueprint';
import { supportDashboardBlueprint } from '../blueprints/support-dashboard.blueprint';

type ApplyDashboardBlueprintCliArgs = {
  dashboardId?: string;
  blueprint: string;
  accessToken?: string;
  baseUrl?: string;
  createDashboard: boolean;
  schemaVersion?: string;
  remote?: string;
  tabs: string[];
};

type ParseCliArgsResult =
  | {
      success: true;
      args: ApplyDashboardBlueprintCliArgs;
    }
  | {
      success: false;
      error: string;
    };

type TwentyConfig = {
  remotes?: Record<
    string,
    {
      apiUrl?: string;
      twentyCLIAccessToken?: string;
    }
  >;
};

type TwentyRemoteConfig = NonNullable<TwentyConfig['remotes']>[string];

const getArgumentValue = (
  argv: string[],
  index: number,
): string | undefined => {
  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    return undefined;
  }

  return value;
};

const parseApplyDashboardBlueprintCliArgs = (
  argv: string[],
): ParseCliArgsResult => {
  const args: ApplyDashboardBlueprintCliArgs = {
    blueprint: 'ambassador-command-center',
    createDashboard: false,
    tabs: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--dashboard-id') {
      const dashboardId = getArgumentValue(argv, index);
      if (!dashboardId) {
        return {
          success: false,
          error: '--dashboard-id requires a UUID value',
        };
      }
      args.dashboardId = dashboardId;
      index += 1;
      continue;
    }

    if (token === '--access-token') {
      const accessToken = getArgumentValue(argv, index);
      if (!accessToken) {
        return {
          success: false,
          error: '--access-token requires a token value',
        };
      }
      args.accessToken = accessToken;
      index += 1;
      continue;
    }

    if (token === '--blueprint') {
      const blueprint = getArgumentValue(argv, index);
      if (!blueprint) {
        return {
          success: false,
          error: '--blueprint requires a blueprint key',
        };
      }
      args.blueprint = blueprint;
      index += 1;
      continue;
    }

    if (token === '--base-url') {
      const baseUrl = getArgumentValue(argv, index);
      if (!baseUrl) {
        return {
          success: false,
          error: '--base-url requires a URL value',
        };
      }
      args.baseUrl = baseUrl;
      index += 1;
      continue;
    }

    if (token === '--create-dashboard') {
      args.createDashboard = true;
      continue;
    }

    if (token === '--schema-version') {
      const schemaVersion = getArgumentValue(argv, index);
      if (!schemaVersion) {
        return {
          success: false,
          error: '--schema-version requires a value',
        };
      }
      args.schemaVersion = schemaVersion;
      index += 1;
      continue;
    }

    if (token === '--remote') {
      const remote = getArgumentValue(argv, index);
      if (!remote) {
        return {
          success: false,
          error: '--remote requires a configured remote name',
        };
      }
      args.remote = remote;
      index += 1;
      continue;
    }

    if (token === '--tab') {
      const tab = getArgumentValue(argv, index);
      if (!tab) {
        return {
          success: false,
          error: '--tab requires a blueprint tab key',
        };
      }
      args.tabs.push(tab);
      index += 1;
    }
  }

  if (!args.dashboardId && args.createDashboard === false) {
    return {
      success: false,
      error: 'Provide --dashboard-id or use --create-dashboard',
    };
  }

  return {
    success: true,
    args,
  };
};

const loadRemoteConfig = (remoteName: string): TwentyRemoteConfig => {
  const configPath = resolve(homedir(), '.twenty/config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8')) as TwentyConfig;
  const remote = config.remotes?.[remoteName];

  if (!remote) {
    throw new Error(`Remote ${remoteName} was not found in ${configPath}`);
  }

  return remote;
};

const dashboardBlueprints: Record<string, DashboardBlueprint> = {
  'ambassador-command-center': ambassadorCommandCenterBlueprint,
  'leads-and-customers': leadsAndCustomersBlueprint,
  'ops-command-center': opsCommandCenterBlueprint,
  'orders-dashboard': ordersDashboardBlueprint,
  'payments-dashboard': paymentsDashboardBlueprint,
  'fulfillment-dashboard': fulfillmentDashboardBlueprint,
  'risk-exceptions-dashboard': riskExceptionsDashboardBlueprint,
  'comp-integrity-dashboard': compIntegrityDashboardBlueprint,
  'support-dashboard': supportDashboardBlueprint,
};

const resolveApiConfig = async (
  args: ApplyDashboardBlueprintCliArgs,
): Promise<DashboardApplyApiConfig> => {
  const envAccessToken = process.env.TWENTY_ACCESS_TOKEN;
  const envBaseUrl = process.env.TWENTY_BASE_URL;
  const envSchemaVersion = process.env.TWENTY_SCHEMA_VERSION;
  const remoteName = args.remote ?? process.env.TWENTY_REMOTE;
  const remote = remoteName ? loadRemoteConfig(remoteName) : undefined;

  const accessToken =
    args.accessToken ?? envAccessToken ?? remote?.twentyCLIAccessToken;
  const baseUrl = args.baseUrl ?? envBaseUrl ?? remote?.apiUrl ?? 'http://localhost:2020';

  if (!accessToken) {
    throw new Error(
      'Missing access token. Use --access-token, TWENTY_ACCESS_TOKEN, or a configured --remote with a valid twentyCLIAccessToken.',
    );
  }

  const schemaVersion =
    args.schemaVersion ??
    envSchemaVersion ??
    (await fetchCurrentSchemaVersion(baseUrl, accessToken));

  return {
    accessToken,
    baseUrl,
    schemaVersion,
  };
};

const fetchCurrentSchemaVersion = async (
  baseUrl: string,
  accessToken: string,
): Promise<string> => {
  const response = await fetch(`${baseUrl}/metadata`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'x-locale': 'en',
    },
    body: JSON.stringify({
      query: 'query { currentWorkspace { metadataVersion } }',
      variables: {},
    }),
  });
  const body = (await response.json()) as {
    data?: { currentWorkspace?: { metadataVersion?: number } };
    errors?: Array<{ message: string }>;
  };

  if (body.errors && body.errors.length > 0) {
    throw new Error(body.errors.map((error) => error.message).join('\n'));
  }

  const metadataVersion = body.data?.currentWorkspace?.metadataVersion;

  if (metadataVersion === undefined) {
    throw new Error('Unable to determine current workspace metadata version');
  }

  return `${metadataVersion}`;
};

export const executeApplyDashboardBlueprintCli = async (
  argv: string[],
): Promise<void> => {
  const parsedArgs = parseApplyDashboardBlueprintCliArgs(argv);

  if (parsedArgs.success === false) {
    throw new Error(parsedArgs.error);
  }

  const apiConfig = await resolveApiConfig(parsedArgs.args);
  const blueprint = dashboardBlueprints[parsedArgs.args.blueprint];

  if (!blueprint) {
    throw new Error(
      `Unknown blueprint ${parsedArgs.args.blueprint}. Available: ${Object.keys(
        dashboardBlueprints,
      ).join(', ')}`,
    );
  }

  const result = await applyDashboardBlueprint(
    blueprint,
    apiConfig,
    {
      dashboardId: parsedArgs.args.dashboardId,
      createDashboard: parsedArgs.args.createDashboard,
      tabs: parsedArgs.args.tabs,
    },
  );

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
};

const main = async (): Promise<void> => {
  await executeApplyDashboardBlueprintCli(process.argv.slice(2));
};

const isExecutedDirectly = (): boolean => {
  if (!process.argv[1]) {
    return false;
  }

  return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
};

if (isExecutedDirectly()) {
  main().catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown dashboard blueprint error';
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
}
