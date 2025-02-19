import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import React, { useEffect, useState } from 'react';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type ReleaseNote = {
  slug: string;
  date: string;
  release: string;
  content: string;
  html: string;
};

const StyledReleaseContainer = styled.div`
  img {
    margin: ${({ theme }) => theme.spacing(6)} 0px 0px;
    max-width: 100%;
  }

  p img {
    margin: 0px;
  }

  h3 {
    color: ${({ theme }) => theme.font.color.primary};
    margin: ${({ theme }) => theme.spacing(6)} 0px 0px;
  }
  code {
    background: ${({ theme }) => theme.background.tertiary};
    padding: 4px;
    border-radius: 4px;
  }
  p {
    color: ${({ theme }) => theme.font.color.secondary};
    font-family: Inter, sans-serif;
    font-size: ${({ theme }) => theme.font.size.md};
    line-height: 19.5px;
    font-weight: ${({ theme }) => theme.font.weight.regular};
    margin: ${({ theme }) => theme.spacing(6)} 0px 0px;
    text-align: justify;
  }

  li {
    color: ${({ theme }) => theme.font.color.secondary};
  }

  li strong {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledReleaseHeader = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 18px;
  font-size: ${({ theme }) => theme.font.size.md};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(10)};

  &:first-of-type {
    margin-top: 0;
  }
`;

const StyledReleaseDate = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const Releases = () => {
  const { t } = useLingui();
  const [releases, setReleases] = useState<ReleaseNote[]>([]);

  useEffect(() => {
    fetch('https://twenty.com/api/releases').then(async (res) => {
      const json = await res.json();
      for (const release of json) {
        release.html = String(
          await unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeStringify)
            .use(() => (tree: any) => {
              visit(tree, (node) => {
                if (node.tagName === 'h1' || node.tagName === 'h2') {
                  node.tagName = 'h3';
                }
              });
            })
            .process(release.content),
        );
      }
      setReleases(json);
    });
  }, []);

  return (
    <SubMenuTopBarContainer
      title={t`Releases`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Releases</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <ScrollWrapper
          contextProviderName="releases"
          componentInstanceId="scroll-wrapper-releases"
        >
          <StyledReleaseContainer>
            {releases.map((release) => (
              <React.Fragment key={release.slug}>
                <StyledReleaseHeader>{release.release}</StyledReleaseHeader>
                <StyledReleaseDate>{release.date}</StyledReleaseDate>
                <div dangerouslySetInnerHTML={{ __html: release.html }}></div>
              </React.Fragment>
            ))}
          </StyledReleaseContainer>
        </ScrollWrapper>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
