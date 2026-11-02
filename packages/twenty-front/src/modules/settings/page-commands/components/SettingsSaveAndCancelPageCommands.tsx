import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { type PageCommand } from '@/command-menu-item/page-command/types/PageCommand';
import { EngineComponentKey } from '~/generated-metadata/graphql';

type SettingsSaveAndCancelPageCommandsProps = {
  onSave: PageCommand['run'];
  onCancel: PageCommand['run'];
  isSaveDisabled?: boolean;
  isCancelDisabled?: boolean;
  isLoading?: boolean;
};

export const SettingsSaveAndCancelPageCommands = ({
  onSave,
  onCancel,
  isSaveDisabled,
  isCancelDisabled,
  isLoading,
}: SettingsSaveAndCancelPageCommandsProps) => (
  <>
    <PageCommandEffect
      engineComponentKey={EngineComponentKey.SAVE_PAGE}
      onRun={onSave}
      isDisabled={isSaveDisabled}
      isLoading={isLoading}
    />
    <PageCommandEffect
      engineComponentKey={EngineComponentKey.CANCEL_PAGE}
      onRun={onCancel}
      isDisabled={isCancelDisabled}
    />
  </>
);
