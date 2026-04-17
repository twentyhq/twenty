import { useLingui } from '@lingui/react/macro';

import { RESET_RECORD_PAGE_LAYOUT_MODAL_ID } from '@/layout-customization/constants/ResetRecordPageLayoutModalId';
import { useCurrentRecordPageLayoutInCustomization } from '@/layout-customization/hooks/useCurrentRecordPageLayoutInCustomization';
import { useExitLayoutCustomizationMode } from '@/layout-customization/hooks/useExitLayoutCustomizationMode';
import { useResetPageLayoutToDefault } from '@/page-layout/hooks/useResetPageLayoutToDefault';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

export const LayoutCustomizationBarResetConfirmationModal = () => {
  const { t } = useLingui();

  const currentRecordPageLayout = useCurrentRecordPageLayoutInCustomization();
  const { resetPageLayoutToDefault } = useResetPageLayoutToDefault();
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();

  const handleConfirmReset = async () => {
    if (currentRecordPageLayout === null) {
      return;
    }

    await resetPageLayoutToDefault({
      pageLayoutId: currentRecordPageLayout.pageLayoutId,
    });

    exitLayoutCustomizationMode();
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
