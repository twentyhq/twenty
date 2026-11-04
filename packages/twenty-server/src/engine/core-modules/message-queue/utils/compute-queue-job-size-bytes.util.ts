import { JOB_SIZE_OVERHEAD_BYTES } from 'src/engine/core-modules/message-queue/constants/job-size-overhead-bytes.constant';

const computeSerializedByteLength = (value: unknown): number =>
  Buffer.byteLength(JSON.stringify(value) ?? '');

export const computeQueueJobSizeBytes = ({
  data,
  options,
}: {
  data: unknown;
  options: object;
}): number =>
  computeSerializedByteLength(data) +
  computeSerializedByteLength(options) +
  JOB_SIZE_OVERHEAD_BYTES;
