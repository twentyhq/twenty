import { useLingui } from '@lingui/react/macro';

import { RESET_RECORD_PAGE_LAYOUT_MODAL_ID } from '@/layout-customization/constants/ResetRecordPageLayoutModalId';
import { useRefreshPageLayoutAfterReset } from '@/page-layout/hooks/useRefreshPageLayoutAfterReset';
import { useResetPageLayoutToDefault } from '@/page-layout/hooks/useResetPageLayoutToDefault';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

type LayoutCustomizationBarResetConfirmationModalProps = {
  pageLayoutId: string;
};

export const LayoutCustomizationBarResetConfirmationModal = ({
  pageLayoutId,
}: LayoutCustomizationBarResetConfirmationModalProps) => {
  const { t } = useLingui();

  const { resetPageLayoutToDefault } = useResetPageLayoutToDefault();
  const { refreshPageLayoutAfterReset } =
    useRefreshPageLayoutAfterReset(pageLayoutId);

  const handleConfirmReset = async () => {
    await resetPageLayoutToDefault({ pageLayoutId });
    await refreshPageLayoutAfterReset();
  };

  return (
    <ConfirmationModal
      modalInstanceId={RESET_RECORD_PAGE_LAYOUT_MODAL_ID}
      title={t`Reset to default`}
      subtitle={t`This action cannot be undone.`}
      onConfirmClick={handleConfirmReset}
      confirmButtonText={t`Reset`}
      confirmButtonAccent="danger"
    />
  );
};
