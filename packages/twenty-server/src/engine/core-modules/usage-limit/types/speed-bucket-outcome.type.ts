import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';

export type SpeedBucketOutcome =
  | { admitted: true; admittedCount: number }
  | {
      admitted: false;
      admittedCount: number;
      exhausted: SpeedBucketRequest;
      retryAfterMs: number;
    };
