export type TelegramUserLinkRecord = {
  id: string;
  name: string;
  telegramUsername: string;
  workspaceMemberId: string | undefined;
  workspaceMemberName: string;
};
