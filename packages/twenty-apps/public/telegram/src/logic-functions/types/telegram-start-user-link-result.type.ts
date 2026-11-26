export type TelegramStartUserLinkResult =
  | {
      success: true;
      url: string;
      botUsername: string;
      startCommand: string;
      expiresAt: string;
    }
  | { success: false; message: string; error: string };
