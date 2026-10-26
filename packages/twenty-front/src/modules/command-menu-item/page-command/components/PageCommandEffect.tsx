import { useRegisterPageCommand } from '@/command-menu-item/page-command/hooks/useRegisterPageCommand';
import { type PageCommand } from '@/command-menu-item/page-command/types/PageCommand';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

type PageCommandEffectProps = {
  engineComponentKey: EngineComponentKey;
  onRun: PageCommand['run'];
  isDisabled?: boolean;
  isLoading?: boolean;
  progress?: number;
};

export const PageCommandEffect = (props: PageCommandEffectProps) => {
  useRegisterPageCommand(props);

  return null;
};
