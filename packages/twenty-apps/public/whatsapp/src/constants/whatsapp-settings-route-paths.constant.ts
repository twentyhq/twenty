export const WHATSAPP_SETTINGS_ROUTE_PATHS = {
  get: '/whatsapp/settings',
  update: '/whatsapp/settings/update',
  syncHistory: '/whatsapp/history/sync',
  cancelHistoryImport: '/whatsapp/history/cancel',
  listChats: '/whatsapp/chats',
} as const;
