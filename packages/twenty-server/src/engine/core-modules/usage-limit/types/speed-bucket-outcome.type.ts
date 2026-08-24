import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';

export type SpeedBucketOutcome =
  | { admitted: true; remainingByBucket: number[] }
  | {
      admitted: false;
      exhausted: SpeedBucketRequest;
      retryAfterMs: number;
    };
