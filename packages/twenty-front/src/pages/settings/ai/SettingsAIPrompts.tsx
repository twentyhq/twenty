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
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { GetAiSystemPromptPreviewDocument } from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTokenBadge = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing['0.5']}
    ${themeCssVariables.spacing['1.5']};
  white-space: nowrap;
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
    ? t`~${formatNumber(preview.estimatedTokenCount, {
        abbreviate: true,
        decimals: 1,
      })} tokens`
    : '';
  const pageTitle = isDefined(preview)
    ? t`System Prompt (${totalTokenCount})`
    : t`System Prompt`;

  return (
    <SubMenuTopBarContainer
      title={pageTitle}
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
        {promptSections.map((section) => (
          <Section key={section.title}>
            <H2Title
              title={section.title}
              description={t`Read-only — managed by Twenty`}
              adornment={
                <StyledTokenBadge>
                  {formatNumber(section.estimatedTokenCount, {
                    abbreviate: true,
                    decimals: 1,
                  })}
                </StyledTokenBadge>
              }
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
        ))}

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
