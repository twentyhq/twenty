import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type JsonValue } from 'type-fest';
import {
  GetToolIndexDocument,
  GetToolInputSchemaDocument,
} from '~/generated-metadata/graphql';

const StyledSchemaContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

export const SettingsSystemToolDetail = () => {
  const { toolName = '' } = useParams();
  const { theme } = useContext(ThemeContext);

  const { data: toolIndexData, loading: toolIndexLoading } =
    useQuery(GetToolIndexDocument);

  const tool = toolIndexData?.getToolIndex.find(
    (entry) => entry.name === toolName,
  );

  const { data: schemaData, loading: schemaLoading } = useQuery(
    GetToolInputSchemaDocument,
    {
      variables: { toolName },
      skip: !isDefined(tool),
    },
  );

  const loading = toolIndexLoading || schemaLoading;

  const inputSchema = schemaData?.getToolInputSchema;

  const hasInputSchema =
    isDefined(inputSchema) && Object.keys(inputSchema).length > 0;

  return (
    <SubMenuTopBarContainer
      title={toolName}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`AI`,
          href: getSettingsPath(SettingsPath.AI, undefined, undefined, 'tools'),
        },
        { children: toolName },
      ]}
    >
      <SettingsPageContainer>
        {loading ? (
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <Skeleton height={20} width={512} />
          </SkeletonTheme>
        ) : (
          <>
            {isDefined(tool?.description) && (
              <Section>
                <H2Title
                  title={t`Description`}
                  description={tool.description}
                />
              </Section>
            )}
            <Section>
              <H2Title
                title={t`Input Schema`}
                description={t`Parameters accepted by this tool`}
              />
              {hasInputSchema ? (
                <StyledSchemaContainer>
                  <JsonTree
                    value={inputSchema as JsonValue}
                    shouldExpandNodeInitially={() => true}
                    emptyArrayLabel={t`Empty Array`}
                    emptyObjectLabel={t`No parameters`}
                    emptyStringLabel={t`[empty string]`}
                    arrowButtonCollapsedLabel={t`Expand`}
                    arrowButtonExpandedLabel={t`Collapse`}
                  />
                </StyledSchemaContainer>
              ) : (
                <div>{t`No parameters`}</div>
              )}
            </Section>
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
