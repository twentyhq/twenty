import { z } from "zod";

export const plaintextStringSchema = z.string().brand("PLAINTEXT_STRING_BRAND");

export type PlaintextString = z.infer<typeof plaintextStringSchema>;
