import { createCipheriv, createDecipheriv, createHash } from 'crypto';

import * as bcrypt from 'bcrypt';

export const PASSWORD_REGEX = /^.{8,}$/;

const saltRounds = 10;

export const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, saltRounds);

  return hash;
};

export const compareHash = async (password: string, passwordHash: string) => {
  return bcrypt.compare(password, passwordHash);
};

export const encryptText = async (
  textToEncrypt: string,
  key: string,
  iv: string,
): Promise<string> => {
  const keyHash = createHash('sha512')
    .update(key)
    .digest('hex')
    .substring(0, 32);

  const ivHash = createHash('sha512').update(iv).digest('hex').substring(0, 16);

  const cipher = createCipheriv('aes-256-ctr', keyHash, ivHash);

  return Buffer.concat([cipher.update(textToEncrypt), cipher.final()]).toString(
    'base64',
  );
};

export const decryptText = async (
  textToDecrypt: string,
  key: string,
  iv: string,
) => {
  const keyHash = createHash('sha512')
    .update(key)
    .digest('hex')
    .substring(0, 32);

  const ivHash = createHash('sha512').update(iv).digest('hex').substring(0, 16);

  const decipher = createDecipheriv('aes-256-ctr', keyHash, ivHash);

  return Buffer.concat([
    decipher.update(Buffer.from(textToDecrypt, 'base64')),
    decipher.final(),
  ]).toString();
};
