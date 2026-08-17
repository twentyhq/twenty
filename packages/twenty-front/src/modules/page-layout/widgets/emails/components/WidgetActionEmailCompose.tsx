import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';

export const WidgetActionEmailCompose = () => {
  const { openComposer, loading } = useComposeEmailForTargetRecord();

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={t`Compose`}
      onClick={openComposer}
      disabled={loading}
    />
  );
};
