import { ConfirmationModalProps } from '@/ui/layout/modal/components/ConfirmationModal';

export type ActionHookResult = {
  shouldBeRegistered: boolean;
  onClick: () => Promise<void> | void;
  ConfirmationModal?: React.ReactElement<ConfirmationModalProps>;
};
