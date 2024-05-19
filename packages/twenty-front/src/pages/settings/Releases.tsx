import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { IconSettings } from 'twenty-ui';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

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
    margin: ${({ theme }) => theme.spacing(6)} 0px 0px;
  }
  code {
    background: ${({ theme }) => theme.background.tertiary};
    padding: 4px;
    border-radius: 4px;
  }
  p {
    color: #474747;
    font-family: Inter, sans-serif;
    font-size: ${({ theme }) => theme.font.size.md};
    line-height: 19.5px;
    font-weight: ${({ theme }) => theme.font.weight.regular};
    margin: ${({ theme }) => theme.spacing(6)} 0px 0px;
    text-align: justify;
  }
`;

const StyledReleaseHeader = styled.h2<{ $colorScheme: string }>`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ $colorScheme, theme }) =>
    $colorScheme === 'Dark' ? theme.font.color.primary : ''};
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

const StyledHTMLWrapper = styled.div<{ $colorScheme: string }>`
  h3 {
    color: ${({ $colorScheme, theme }) =>
      $colorScheme === 'Dark' ? theme.font.color.secondary : ''};
  }
`;

export const Releases = () => {
  const systemColorScheme = useSystemColorScheme();
  const { colorScheme } = useColorScheme();
  const [releases, setReleases] = useState<ReleaseNote[]>([]);

  const computedColorScheme =
    colorScheme === 'System' ? systemColorScheme : colorScheme;

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
    <SubMenuTopBarContainer Icon={IconSettings} title="Releases">
      <SettingsPageContainer>
        <StyledH1Title title="Releases" />
        <ScrollWrapper>
          <StyledReleaseContainer>
            {releases.map((release) => (
              <React.Fragment key={release.slug}>
                <StyledReleaseHeader $colorScheme={computedColorScheme}>
                  {release.release}
                </StyledReleaseHeader>
                <StyledReleaseDate>{release.date}</StyledReleaseDate>
                <StyledHTMLWrapper
                  $colorScheme={computedColorScheme}
                  dangerouslySetInnerHTML={{ __html: release.html }}
                />
              </React.Fragment>
            ))}
          </StyledReleaseContainer>
        </ScrollWrapper>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
