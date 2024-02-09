import { useTheme } from '@emotion/react';

import { IconBrandGithub } from '@/ui/display/icon';
import { LinkButton } from '@/ui/input/button/components/LinkButton.tsx';

import packageJson from '../../../../../../package.json';
import { githubLink } from '../constants';

export const GithubVersionLink = () => {
  const theme = useTheme();

  return (
    <LinkButton href={githubLink} target="_blank" rel="noreferrer">
      <IconBrandGithub size={theme.icon.size.md} />
      {packageJson.version}
    </LinkButton>
  );
};
