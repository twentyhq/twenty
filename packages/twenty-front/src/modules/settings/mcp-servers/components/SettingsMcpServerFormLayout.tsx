import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { useNavigateToMcpServersList } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersList';
import { type McpServerFormValues } from '@/settings/mcp-servers/validation-schemas/mcpServerFormSchema';

type SettingsMcpServerFormLayoutProps = {
  title: string;
  breadcrumbTitle: string;
  onSave: (formValues: McpServerFormValues) => Promise<void>;
  children: ReactNode;
};

export const SettingsMcpServerFormLayout = ({
  title,
  breadcrumbTitle,
  onSave,
  children,
}: SettingsMcpServerFormLayoutProps) => {
  const { t } = useLingui();
  const { navigateToMcpServersList } = useNavigateToMcpServersList();
  const {
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
  } = useFormContext<McpServerFormValues>();

  return (
    <SettingsPageLayout
      title={title}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`AI`,
          href: getSettingsPath(
            SettingsPath.AI,
            undefined,
            undefined,
            SETTINGS_AI_TABS.TABS_IDS.TOOLS,
          ),
        },
        { children: breadcrumbTitle },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!isDirty || !isValid || isSubmitting}
          isCancelDisabled={isSubmitting}
          onCancel={navigateToMcpServersList}
          onSave={handleSubmit(onSave)}
        />
      }
    >
      <SettingsPageContainer>{children}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
