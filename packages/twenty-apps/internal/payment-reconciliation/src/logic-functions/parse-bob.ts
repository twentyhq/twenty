import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';

import { PARSE_BOB_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';
import { parseAmbetterBob } from 'src/utils/parse-ambetter-bob';
import { parseXlsxSheet } from 'src/utils/xlsx-parser';

type SourceFileRecord = {
  id: string;
  name?: string;
  parseStatus?: string;
  sheetName?: string;
  uploadedFile?: {
    fileId?: string;
    url?: string;
  }[];
  carrierConfigId?: string;
};

type CarrierConfigNode = {
  id: string;
  parserId: string | null;
  bobColumnMapping: Record<string, string[]> | null;
};

const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mutationWithRetry = async (
  mutation: Record<string, unknown>,
): Promise<void> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const retryClient = new CoreApiClient();

      await retryClient.mutation(mutation);

      return;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `mutation failed after ${MAX_RETRIES + 1} attempts: ${msg}`,
        );
      }

      const delay =
        BASE_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;

      console.log(
        `[parse-bob] Mutation attempt ${
          attempt + 1
        } failed (${msg}), retrying in ${Math.round(delay)}ms`,
      );

      await sleep(delay);
    }
  }
};

const handler = async (
  params: DatabaseEventPayload<ObjectRecordCreateEvent<SourceFileRecord>>,
) => {
  const sourceFile = params.properties.after;

  // Idempotency guard
  if (sourceFile.parseStatus !== 'PENDING') {
    console.log(
      `[parse-bob] SourceFile ${sourceFile.id} status is "${sourceFile.parseStatus}", skipping`,
    );

    return;
  }

  const client = new CoreApiClient();

  // Update status to PARSING
  await client.mutation({
    updatePayReconSourceFile: {
      __args: {
        id: sourceFile.id,
        data: { parseStatus: 'PARSING' },
      },
      id: true,
    },
  });

  try {
    // Fetch carrier config
    if (!sourceFile.carrierConfigId) {
      throw new Error('No carrier config linked to this source file');
    }

    const { payReconCarrierConfigs: carrierConfigResult } = (await client.query(
      {
        payReconCarrierConfigs: {
          __args: {
            filter: { id: { eq: sourceFile.carrierConfigId } },
            first: 1,
          },
          edges: {
            node: {
              id: true,
              parserId: true,
              bobColumnMapping: true,
            },
          },
        },
      },
    )) as unknown as {
      payReconCarrierConfigs: {
        edges: { node: CarrierConfigNode }[];
      };
    };

    const carrierConfig = carrierConfigResult.edges[0]?.node;

    if (!carrierConfig) {
      throw new Error(`Carrier config ${sourceFile.carrierConfigId} not found`);
    }

    if (!carrierConfig.bobColumnMapping) {
      throw new Error('Carrier config has no bobColumnMapping');
    }

    // Re-fetch the source file via CoreApiClient to get resolved file URL
    const { payReconSourceFiles: sfResult } = (await client.query({
      payReconSourceFiles: {
        __args: { filter: { id: { eq: sourceFile.id } }, first: 1 },
        edges: {
          node: {
            id: true,
            uploadedFile: { url: true, fileId: true },
          },
        },
      },
    })) as unknown as {
      payReconSourceFiles: {
        edges: {
          node: {
            id: string;
            uploadedFile: { url?: string; fileId?: string }[];
          };
        }[];
      };
    };

    const resolvedFile = sfResult.edges[0]?.node?.uploadedFile?.[0];

    if (!resolvedFile?.url) {
      throw new Error(
        `No file URL resolved for SourceFile ${sourceFile.id}: ${JSON.stringify(
          resolvedFile,
        )}`,
      );
    }

    const fileUrl = resolvedFile.url;

    console.log(`[parse-bob] Downloading file from: ${fileUrl}`);

    let fileResponse: Response;

    try {
      fileResponse = await fetch(fileUrl);
    } catch (fetchError) {
      const msg =
        fetchError instanceof Error ? fetchError.message : String(fetchError);

      console.error(`[parse-bob] fetch() threw: ${msg}`);
      throw new Error(`fetch failed: ${msg}`);
    }

    if (!fileResponse.ok) {
      throw new Error(
        `Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`,
      );
    }

    // Parse XLSX and normalize — then release the large buffers immediately
    let batchQueue: Record<string, unknown>[];
    let totalRows: number;

    {
      const arrayBuffer = await fileResponse.arrayBuffer();
      const rows = parseXlsxSheet(arrayBuffer, sourceFile.sheetName);

      const parserId = carrierConfig.parserId ?? 'ambetter-bob-v1';

      if (parserId !== 'ambetter-bob-v1') {
        throw new Error(`Unknown parser ID: "${parserId}"`);
      }

      const { normalized, errors: parseErrors } = parseAmbetterBob(
        rows,
        carrierConfig.bobColumnMapping as Record<string, string[]>,
      );

      if (parseErrors.length > 0) {
        console.log(
          `[parse-bob] ${parseErrors.length} row-level errors during parsing`,
          parseErrors.slice(0, 5),
        );
      }

      totalRows = normalized.length;
      batchQueue = normalized.map((row) => ({
        name: row.name,
        rowNumber: row.rowNumber,
        carrierPolicyNumber: row.carrierPolicyNumber,
        subscriberNumber: row.subscriberNumber,
        memberFirstName: row.memberFirstName,
        memberLastName: row.memberLastName,
        memberDob: row.memberDob,
        brokerName: row.brokerName,
        brokerEffectiveDate: row.brokerEffectiveDate,
        policyEffectiveDate: row.policyEffectiveDate,
        trueEffectiveDate: row.trueEffectiveDate,
        paidThroughDate: row.paidThroughDate,
        termDate: row.termDate,
        eligibleForCommission: row.eligibleForCommission,
        numberOfMembers: row.numberOfMembers,
        planName: row.planName,
        monthlyPremium: row.monthlyPremium,
        memberResponsibility: row.memberResponsibility,
        memberPhone: row.memberPhone,
        memberEmail: row.memberEmail,
        exchangeSubscriberId: row.exchangeSubscriberId,
        brokerNpn: row.brokerNpn,
        payableAgent: row.payableAgent,
        onOffExchange: row.onOffExchange,
        county: row.county,
        state: row.state,
        rawPayload: row.rawPayload,
        sourceFileId: sourceFile.id,
      }));
      // buffer, rows, normalized, parseErrors all go out of scope here
    }

    console.log(`[parse-bob] Parsed ${totalRows} rows, starting batch insert`);

    // Create NormalizedBookRow records in batches (fresh client + retry per batch)
    let created = 0;

    while (batchQueue.length > 0) {
      const batch = batchQueue.splice(0, BATCH_SIZE);

      await mutationWithRetry({
        createPayReconNormalizedBookRows: {
          __args: { data: batch },
          id: true,
        },
      });

      created += batch.length;

      if (created % 200 === 0 || created === totalRows) {
        console.log(
          `[parse-bob] Progress: ${created}/${totalRows} rows created`,
        );
      }

      if (batchQueue.length > 0) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    // Update source file with success
    await mutationWithRetry({
      updatePayReconSourceFile: {
        __args: {
          id: sourceFile.id,
          data: {
            parseStatus: 'COMPLETED',
            totalRows,
            parsedAt: new Date().toISOString(),
          },
        },
        id: true,
      },
    });

    console.log(
      `[parse-bob] Successfully parsed ${totalRows} rows from SourceFile ${sourceFile.id}`,
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error(
      `[parse-bob] Failed for SourceFile ${sourceFile.id}:`,
      errorMessage,
    );

    try {
      const errorClient = new CoreApiClient();

      await errorClient.mutation({
        updatePayReconSourceFile: {
          __args: {
            id: sourceFile.id,
            data: {
              parseStatus: 'FAILED',
              parseError: errorMessage.slice(0, 500),
            },
          },
          id: true,
        },
      });
    } catch (updateError) {
      console.error(
        `[parse-bob] Failed to update status to FAILED:`,
        updateError instanceof Error
          ? updateError.message
          : String(updateError),
      );
    }
  }
};

export default defineLogicFunction({
  universalIdentifier: PARSE_BOB_LOGIC_FUNCTION_ID,
  name: 'parse-bob',
  description:
    'Parses an uploaded carrier BOB file into NormalizedBookRow records',
  timeoutSeconds: 900,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'payReconSourceFile.created',
  },
});
