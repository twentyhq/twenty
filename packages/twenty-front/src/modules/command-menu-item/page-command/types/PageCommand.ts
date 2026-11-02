export type PageCommand = {
  run: () => void | Promise<unknown>;
  isDisabled: boolean;
  isLoading: boolean;
  progress?: number;
  to?: string;
  registrationId: string;
};
