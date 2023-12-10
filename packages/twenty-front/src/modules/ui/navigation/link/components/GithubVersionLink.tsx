import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconBrandGithub } from '@/ui/display/icon';

import packageJson from '../../../../../../package.json';
import { githubLink } from '../constants';

const StyledVersionLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  text-decoration: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export const GithubVersionLink = () => {
  const theme = useTheme();

  return (
    <StyledVersionLink href={githubLink} target="_blank" rel="noreferrer">
      <IconBrandGithub size={theme.icon.size.md} />
      {packageJson.version}
    </StyledVersionLink>
  );
};
