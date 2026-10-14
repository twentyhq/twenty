import { SRI_ALGORITHM } from 'src/engine/core-modules/application/application-registration-version/constants/sri-algorithm.constant';
import { type SriAlgorithm } from 'src/engine/core-modules/application/application-registration-version/utils/parse-sri-integrity.util';

export const toSriString = ({
  digest,
  algorithm = SRI_ALGORITHM,
}: {
  digest: Buffer;
  algorithm?: SriAlgorithm;
}): string => `${algorithm}-${digest.toString('base64')}`;
