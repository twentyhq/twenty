import { type OFFLOADED_JOB_PAYLOAD_KEY } from 'src/engine/core-modules/message-queue/drivers/payload/offloaded-job-payload-key.constant';

export type OffloadedJobPayloadReference = {
  path: string;
  sizeBytes: number;
  sha256: string;
};

export type OffloadedJobPayload = {
  [OFFLOADED_JOB_PAYLOAD_KEY]: OffloadedJobPayloadReference;
};
