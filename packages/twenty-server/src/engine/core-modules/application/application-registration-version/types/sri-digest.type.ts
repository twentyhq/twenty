import { type SriAlgorithm } from 'src/engine/core-modules/application/application-registration-version/types/sri-algorithm.type';

export type SriDigest = { algorithm: SriAlgorithm; digest: string };
