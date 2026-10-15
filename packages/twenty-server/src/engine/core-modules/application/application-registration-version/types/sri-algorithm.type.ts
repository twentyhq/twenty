import { type SUPPORTED_SRI_ALGORITHMS } from 'src/engine/core-modules/application/application-registration-version/constants/supported-sri-algorithms.constant';

export type SriAlgorithm = (typeof SUPPORTED_SRI_ALGORITHMS)[number];
