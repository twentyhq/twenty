import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it } from 'vitest';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';
import { updateClaimedCallRecordingArtifacts } from 'src/logic-functions/data/update-claimed-call-recording-artifacts.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type ClaimField = 'artifactsImportClaimedAt' | 'transcriptImportClaimedAt';
type Predicate = { eq?: string; is?: 'NULL'; lte?: string };
type ClaimFilter = Partial<Record<ClaimField, Predicate>> & {
  id: { eq: string };
  status?: { eq: string };
  or?: Partial<Record<ClaimField, Predicate>>[];
};

const buildStore = () => {
  const row: CallRecordingUpdateFields & { id: string } = {
    id: 'recording',
    status: CallRecordingStatus.PROCESSING,
    artifactsImportClaimedAt: null,
    transcriptImportClaimedAt: null,
  };
  const matches = (field: ClaimField, predicate: Predicate | undefined) => {
    if (predicate === undefined) return true;
    const value = row[field];
    if (predicate.is === 'NULL') return value === null;
    if (predicate.eq !== undefined) return value === predicate.eq;
    return (
      typeof value === 'string' &&
      predicate.lte !== undefined &&
      value <= predicate.lte
    );
  };
  const client = {
    mutation: async ({
      updateCallRecordings,
    }: {
      updateCallRecordings: {
        __args: { filter: ClaimFilter; data: CallRecordingUpdateFields };
      };
    }) => {
      const { filter, data } = updateCallRecordings.__args;
      const claimFields: ClaimField[] = [
        'artifactsImportClaimedAt',
        'transcriptImportClaimedAt',
      ];
      const hasMatched =
        filter.id.eq === row.id &&
        (filter.status === undefined || row.status === filter.status.eq) &&
        claimFields.every((field) => matches(field, filter[field])) &&
        (filter.or === undefined ||
          filter.or.some((part) =>
            claimFields.every((field) => matches(field, part[field])),
          ));

      if (!hasMatched) return { updateCallRecordings: [] };
      Object.assign(row, data);
      return { updateCallRecordings: [{ id: row.id }] };
    },
  };

  return { row, client: client as unknown as CoreApiClient };
};

const NOW = new Date('2026-01-01T14:06:00.000Z');

describe.each(['media', 'transcript'] as const)(
  '%s artifact import claim',
  (scope) => {
    const field =
      scope === 'media'
        ? 'artifactsImportClaimedAt'
        : 'transcriptImportClaimedAt';

    it('claims processing work and rejects a concurrent worker', async () => {
      const { client, row } = buildStore();
      const request = { callRecordingId: row.id, scope, now: NOW };

      expect(await claimCallRecordingArtifactsImport(client, request)).toBe(
        true,
      );
      expect(await claimCallRecordingArtifactsImport(client, request)).toBe(
        false,
      );
      expect(row[field]).toBe(NOW.toISOString());
    });

    it('does not reclaim while an earlier Lambda can still be running', async () => {
      const { client, row } = buildStore();
      row[field] = new Date(NOW.getTime() - 14 * 60_000).toISOString();

      expect(
        await claimCallRecordingArtifactsImport(client, {
          callRecordingId: row.id,
          scope,
          now: NOW,
        }),
      ).toBe(false);
    });

    it('reclaims an abandoned claim after the maximum execution window', async () => {
      const { client, row } = buildStore();
      row[field] = new Date(NOW.getTime() - 17 * 60_000).toISOString();

      expect(
        await claimCallRecordingArtifactsImport(client, {
          callRecordingId: row.id,
          scope,
          now: NOW,
        }),
      ).toBe(true);
    });

    it('prevents an old worker from writing progress or releasing its replacement claim', async () => {
      const { client, row } = buildStore();
      const oldClaimedAt = new Date(NOW.getTime() - 17 * 60_000).toISOString();
      row[field] = oldClaimedAt;
      await claimCallRecordingArtifactsImport(client, {
        callRecordingId: row.id,
        scope,
        now: NOW,
      });

      await expect(
        updateClaimedCallRecordingArtifacts(client, {
          callRecordingId: row.id,
          scope,
          claimedAt: oldClaimedAt,
          data: { callRecorderFailureReason: 'old-result' },
        }),
      ).rejects.toThrow('no longer active');
      await releaseCallRecordingArtifactsImportClaim(client, {
        callRecordingId: row.id,
        scope,
        claimedAt: oldClaimedAt,
      });

      expect(row[field]).toBe(NOW.toISOString());
      expect(row.callRecorderFailureReason).toBeUndefined();
    });

    it('saves progress and releases only the owned scope', async () => {
      const { client, row } = buildStore();
      row.artifactsImportClaimedAt = NOW.toISOString();
      row.transcriptImportClaimedAt = NOW.toISOString();
      const claim = {
        callRecordingId: row.id,
        scope,
        claimedAt: NOW.toISOString(),
      };

      await updateClaimedCallRecordingArtifacts(client, {
        ...claim,
        data: { callRecorderFailureReason: 'video_file_too_large' },
      });
      await releaseCallRecordingArtifactsImportClaim(client, claim);

      expect(row.callRecorderFailureReason).toBe('video_file_too_large');
      expect(row[field]).toBeNull();
      expect(
        row[
          scope === 'media'
            ? 'transcriptImportClaimedAt'
            : 'artifactsImportClaimedAt'
        ],
      ).toBe(NOW.toISOString());
    });
    it('cannot claim or write to an already completed recording', async () => {
      const { client, row } = buildStore();
      row.status = CallRecordingStatus.COMPLETED;
      row[field] = NOW.toISOString();

      expect(
        await claimCallRecordingArtifactsImport(client, {
          callRecordingId: row.id,
          scope,
          now: NOW,
        }),
      ).toBe(false);
      await expect(
        updateClaimedCallRecordingArtifacts(client, {
          callRecordingId: row.id,
          scope,
          claimedAt: NOW.toISOString(),
          data: { callRecorderFailureReason: 'late-result' },
        }),
      ).rejects.toThrow('no longer active');
      expect(row.callRecorderFailureReason).toBeUndefined();
    });
  },
);
