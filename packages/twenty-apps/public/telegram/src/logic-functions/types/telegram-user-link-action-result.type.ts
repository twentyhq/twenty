export type TelegramUserLinkActionResult =
  | { success: true; message: string }
  | { success: false; message: string; error: string };
