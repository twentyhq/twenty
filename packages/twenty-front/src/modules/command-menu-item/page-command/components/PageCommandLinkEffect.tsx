import { useRegisterPageCommand } from '@/command-menu-item/page-command/hooks/useRegisterPageCommand';
import {
  createPath,
  type LinkProps,
  useNavigate,
  useResolvedPath,
} from 'react-router-dom';
import { type EngineComponentKey } from '~/generated-metadata/graphql';

type PageCommandLinkEffectProps = {
  engineComponentKey: EngineComponentKey;
  to: LinkProps['to'];
  isDisabled?: boolean;
};

export const PageCommandLinkEffect = ({
  engineComponentKey,
  to,
  isDisabled,
}: PageCommandLinkEffectProps) => {
  const navigate = useNavigate();
  const path = createPath(useResolvedPath(to));

  useRegisterPageCommand({
    engineComponentKey,
    onRun: () => navigate(path),
    isDisabled,
    to: path,
  });

  return null;
};
