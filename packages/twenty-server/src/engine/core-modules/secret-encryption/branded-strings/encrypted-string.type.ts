import { z } from 'zod';

const encryptedStringSchema = z.string().brand('ENCRYPTED_STRING_BRAND');

export type EncryptedString = z.infer<typeof encryptedStringSchema>;
