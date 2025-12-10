/* eslint-disable no-console */
/**
 * Fetch historical Fireflies meetings and insert into Twenty.
 *
 * Usage:
 *   yarn meeting:all [--from 2024-01-01] [--to 2024-02-01] [--organizer alice@x.com] [--participant bob@x.com] [--channel <channelId>] [--mine] [--dry-run] [--page-size 50] [--max-records 200]
 *
 * Required env:
 *   FIREFLIES_API_KEY
 *   TWENTY_API_KEY
 *
 * Optional env:
 *   SERVER_URL (defaults to http://localhost:3000)
 *   FIREFLIES_PLAN (free|pro|business|enterprise)
 *   AUTO_CREATE_CONTACTS (true|false)
 *   FIREFLIES_* retry settings (see README)
 */

import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { FirefliesApiClient } from '../src/fireflies-api-client';
import { type HistoricalImportFilters, HistoricalImporter } from '../src/historical-importer';
import { createLogger } from '../src/logger';
import { TwentyCrmService } from '../src/twenty-crm-service';
import {
  getApiUrl,
  getFirefliesPlan,
  getSummaryFetchConfig,
  shouldAutoCreateContacts,
} from '../src/utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const logger = createLogger('cli:meeting:all');

type CliArgs = {
  from?: string;
  to?: string;
  organizer?: string[];
  participant?: string[];
  channel?: string;
  host?: string;
  mine?: boolean;
  dryRun?: boolean;
  pageSize?: number;
  maxRecords?: number;
  limit?: number;
};

const parseArgs = (argv: string[]): CliArgs => {
  const args: CliArgs = {};

  const parseNumberArg = (value?: string): number | undefined => {
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    switch (current) {
      case '--from':
        args.from = next;
        i += 1;
        break;
      case '--to':
        args.to = next;
        i += 1;
        break;
      case '--organizer':
        args.organizer = next ? next.split(',') : [];
        i += 1;
        break;
      case '--participant':
        args.participant = next ? next.split(',') : [];
        i += 1;
        break;
      case '--channel':
        args.channel = next;
        i += 1;
        break;
      case '--host':
        args.host = next;
        i += 1;
        break;
      case '--mine':
        args.mine = true;
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--page-size':
        args.pageSize = parseNumberArg(next);
        i += 1;
        break;
      case '--max-records':
        args.maxRecords = parseNumberArg(next);
        i += 1;
        break;
      case '--limit':
        args.limit = parseNumberArg(next);
        i += 1;
        break;
      default:
        break;
    }
  }

  return args;
};

const parseDate = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const main = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2));

  const firefliesApiKey = process.env.FIREFLIES_API_KEY || '';
  const twentyApiKey = process.env.TWENTY_API_KEY || '';

  if (!firefliesApiKey) {
    console.error('❌ FIREFLIES_API_KEY is required');
    process.exit(1);
  }

  if (!twentyApiKey) {
    console.error('❌ TWENTY_API_KEY is required');
    process.exit(1);
  }

  const fromDate = parseDate(args.from);
  const toDate = parseDate(args.to);

  const filters: HistoricalImportFilters = {
    fromDate,
    toDate,
    organizers: args.organizer,
    participants: args.participant,
    channelId: args.channel,
    hostEmail: args.host,
    mine: args.mine,
    limit: args.limit,
    pageSize: args.pageSize,
    maxRecords: args.maxRecords,
  };

  const summaryConfig = getSummaryFetchConfig();
  const plan = getFirefliesPlan();
  const autoCreateContacts = shouldAutoCreateContacts();

  logger.info(
    `Starting historical import (dryRun=${Boolean(args.dryRun)}, plan=${plan}, pageSize=${filters.pageSize ?? 50})`,
  );

  const firefliesClient = new FirefliesApiClient(firefliesApiKey);
  const twentyService = new TwentyCrmService(twentyApiKey, getApiUrl());
  const importer = new HistoricalImporter(firefliesClient, twentyService);

  const result = await importer.run(filters, {
    dryRun: args.dryRun,
    autoCreateContacts,
    summaryConfig,
    plan,
  });

  console.log('✅ Historical import summary:');
  const summary = {
    dryRun: result.dryRun,
    totalListed: result.totalListed,
    imported: result.imported,
    skippedExisting: result.skippedExisting,
    summaryPending: result.summaryPending,
    failed: result.failed,
  };
  console.log(JSON.stringify(summary, null, 2));

  if (result.statuses.length > 0) {
    console.log('Status by meeting:');
    console.table(
      result.statuses.map((s) => ({
        meetingId: s.meetingId,
        title: s.title ?? '',
        status: s.status,
        reason: s.reason ?? '',
      })),
    );
  }

  if (result.failed.length > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error('❌ Failed to import historical meetings');
  if (error instanceof Error) {
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(String(error));
  }
  process.exit(1);
});


