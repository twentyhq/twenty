import { styled } from '@linaria/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title, H3Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { GetAiSystemPromptPreviewDocument } from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAIPrompts = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { data: previewData, loading: previewLoading } = useQuery(
    GetAiSystemPromptPreviewDocument,
  );

  const preview = previewData?.getAISystemPromptPreview;
  const sections = preview?.sections ?? [];

  const buildUserContextPreview = (): string => {
    if (!isDefined(currentWorkspaceMember)) {
      return '';
    }

    const parts = [
      `**${t`User`}:** ${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`.trim(),
      `**${t`Locale`}:** ${currentWorkspaceMember.locale ?? 'en'}`,
    ];

    if (isDefined(currentWorkspaceMember.timeZone)) {
      parts.push(`**${t`Timezone`}:** ${currentWorkspaceMember.timeZone}`);
    }

    return parts.join('\n\n');
  };

  const userContextPreview = buildUserContextPreview();

  const promptSections = sections.filter(
    (section) =>
      section.title !== 'Workspace Instructions' &&
      section.title !== 'User Context',
  );

  const totalTokenCount = isDefined(preview)
    ? t`~ ${formatNumber(preview.estimatedTokenCount, {
        abbreviate: true,
        decimals: 1,
      })} tokens`
    : '';

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        { children: t`System Prompt` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <StyledTitleContainer>
            <H3Title
              title={t`System Prompt`}
              description={[t`Read-only`, totalTokenCount]
                .filter(Boolean)
                .join(' ')}
            />
          </StyledTitleContainer>
        </Section>
        {promptSections.map((section) => {
          const sectionTokenCount = t`~ ${formatNumber(
            section.estimatedTokenCount,
            {
              abbreviate: true,
              decimals: 1,
            },
          )} tokens`;

          return (
            <Section key={section.title}>
              <H2Title
                title={section.title}
                description={[t`Read-only`, sectionTokenCount]
                  .filter(Boolean)
                  .join(' ')}
              />
              <StyledFormContainer>
                <FormAdvancedTextFieldInput
                  key={
                    previewLoading ? `loading-${section.title}` : section.title
                  }
                  label={section.title}
                  readonly={true}
                  defaultValue={section.content}
                  contentType="markdown"
                  onChange={() => {}}
                  enableFullScreen={true}
                  fullScreenBreadcrumbs={[
                    {
                      children: t`System Prompt`,
                      href: '#',
                    },
                    {
                      children: section.title,
                    },
                  ]}
                  minHeight={120}
                  maxWidth={700}
                />
              </StyledFormContainer>
            </Section>
          );
        })}

        <Section>
          <H2Title
            title={t`User Context`}
            description={t`Information about the current user (auto-generated and included in each request)`}
          />
          <StyledFormContainer>
            <FormAdvancedTextFieldInput
              label={t`User Information`}
              readonly={true}
              defaultValue={userContextPreview}
              contentType="markdown"
              onChange={() => {}}
              enableFullScreen={false}
              minHeight={80}
              maxWidth={700}
            />
          </StyledFormContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
