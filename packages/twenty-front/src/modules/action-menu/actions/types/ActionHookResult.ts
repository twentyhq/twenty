import { ConfirmationModalProps } from '@/ui/layout/modal/components/ConfirmationModal';

export type ActionHookResult = {
  onClick: () => Promise<void> | void;
  ConfirmationModal?: React.ReactElement<ConfirmationModalProps>;
};
