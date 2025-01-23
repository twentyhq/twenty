import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

import * as bcrypt from 'bcrypt';

export const PASSWORD_REGEX = /^.{8,}$/;

const saltRounds = 10;

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};

export const compareHash = async (password: string, passwordHash: string) => {
  return bcrypt.compare(password, passwordHash);
};

export const encryptText = (textToEncrypt: string, key: string): string => {
  const keyHash = createHash('sha512')
    .update(key)
    .digest('hex')
    .substring(0, 32);

  const iv = randomBytes(16);

  const cipher = createCipheriv('aes-256-ctr', keyHash, iv);

  return Buffer.concat([
    iv,
    cipher.update(textToEncrypt),
    cipher.final(),
  ]).toString('base64');
};

export const decryptText = (textToDecrypt: string, key: string): string => {
  const textBuffer = Buffer.from(textToDecrypt, 'base64');
  const iv = textBuffer.subarray(0, 16);
  const text = textBuffer.subarray(16);

  const keyHash = createHash('sha512')
    .update(key)
    .digest('hex')
    .substring(0, 32);

  const decipher = createDecipheriv('aes-256-ctr', keyHash, iv);

  return Buffer.concat([decipher.update(text), decipher.final()]).toString();
};
