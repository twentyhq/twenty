import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';
import { useNavigateToMcpServersTab } from '@/settings/mcp-servers/hooks/useNavigateToMcpServersTab';
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
  const { navigateToMcpServersTab } = useNavigateToMcpServersTab();
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
          children: t`Developers`,
          href: getSettingsPath(
            SettingsPath.Developers,
            undefined,
            undefined,
            SETTINGS_DEVELOPERS_TABS.TABS_IDS.MCP_SERVERS,
          ),
        },
        { children: breadcrumbTitle },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!isDirty || !isValid || isSubmitting}
          isCancelDisabled={isSubmitting}
          onCancel={navigateToMcpServersTab}
          onSave={handleSubmit(onSave)}
        />
      }
    >
      <SettingsPageContainer>{children}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
