import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';

export const WidgetActionEmailCompose = () => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const { openComposer, loading } = useComposeEmailForTargetRecord();

  if (isPageLayoutInEditMode) {
    return null;
  }

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={t`Compose`}
      onClick={openComposer}
      disabled={loading}
    />
  );
};
