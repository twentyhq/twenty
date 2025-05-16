import CryptoJS from 'crypto-js';
import { REACT_APP_FOCUS_NFE_ENCRYPTION_KEY } from '~/config';

interface CriptographTextProps {
  encryptText: (text: string) => string;
  decryptText: (cipherText: string) => string;
}

export const useCriptographText = (): CriptographTextProps => {
  const encryptText = (text: string) => {
    const secretKey = REACT_APP_FOCUS_NFE_ENCRYPTION_KEY;

    if (!secretKey) return text;
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse(secretKey.slice(0, 16));

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  };

  const decryptText = (cipherText: string) => {
    const secretKey = REACT_APP_FOCUS_NFE_ENCRYPTION_KEY;
    if (!secretKey) return cipherText;
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return bytes.toString(CryptoJS.enc.Utf8);
  };

  return {
    encryptText,
    decryptText,
  };
};
