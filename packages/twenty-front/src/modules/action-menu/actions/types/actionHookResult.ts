export type ActionHookResult = {
  shouldBeRegistered: boolean;
  onClick: () => Promise<void> | void;
  ConfirmationModal?: React.ReactElement;
};
