export type TelegramStartUserLinkResult =
  | { success: true; url: string; expiresAt: string }
  | { success: false; message: string; error: string };
