export type ActionHookResult = {
  shouldBeRegistered: boolean;
  onClick: () => void;
  ConfirmationModal?: React.ReactElement;
};
