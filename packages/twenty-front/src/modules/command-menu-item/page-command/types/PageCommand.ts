export type PageCommand = {
  run: () => void | Promise<unknown>;
  isDisabled: boolean;
  isLoading: boolean;
  progress?: number;
  registrationId: string;
};
