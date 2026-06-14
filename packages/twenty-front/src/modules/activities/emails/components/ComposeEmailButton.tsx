import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { IconPlus } from 'twenty-ui-deprecated/display';
import { LightIconButton } from 'twenty-ui-deprecated/input';

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
