import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

export const ComposeEmailButton = () => {
  const { openComposer, loading } = useComposeEmailForTargetRecord();

  return (
    <LightIconButton
      Icon={IconPlus}
      accent="tertiary"
      size="small"
      onClick={openComposer}
      disabled={loading}
    />
  );
};
