export type CompanionError = {
  message: string;
  recovery?: { type: 'open-desktop-installation'; serverUrl: string };
};
