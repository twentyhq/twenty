import { useTheme } from '@emotion/react';
import { IconTag } from 'twenty-ui';

import { ActionLink } from '@/ui/navigation/link/components/ActionLink';

import packageJson from '../../../../../../package.json';
import { GITHUB_LINK } from '../constants/GithubLink';

export const GithubVersionLink = () => {
  const theme = useTheme();

  return (
    <ActionLink href={GITHUB_LINK} target="_blank" rel="noreferrer">
      <IconTag size={theme.icon.size.md} />
      {packageJson.version}
    </ActionLink>
  );
};
