import * as crypto from 'node:crypto';

export type HmacAlgorithm = 'sha1' | 'sha256';

export const computeHmac = ({
  algorithm,
  secret,
  payload,
}: {
  algorithm: HmacAlgorithm;
  secret: string;
  payload: string | Buffer;
}): string =>
  crypto.createHmac(algorithm, secret).update(payload).digest('hex');

export const timingSafeStringEqual = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

export const verifyHmacSignature = ({
  algorithm,
  secret,
  payload,
  expectedSignature,
}: {
  algorithm: HmacAlgorithm;
  secret: string;
  payload: string | Buffer;
  expectedSignature: string;
}): boolean => {
  const computed = computeHmac({ algorithm, secret, payload });

  return timingSafeStringEqual(computed, expectedSignature);
};
