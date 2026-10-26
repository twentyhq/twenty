import { useRegisterPageCommand } from '@/command-menu-item/page-command/hooks/useRegisterPageCommand';
import { type LinkProps, useNavigate } from 'react-router-dom';
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

  useRegisterPageCommand({
    engineComponentKey,
    onRun: () => navigate(to),
    isDisabled,
  });

  return null;
};
