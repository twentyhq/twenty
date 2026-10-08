import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconSparkles } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWizardStepBar } from '@/settings/components/layout/SettingsWizardStepBar';
import { SettingsObjectNewFieldHeaderIcon } from '@/settings/data-model/fields/components/SettingsObjectNewFieldHeaderIcon';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { OBJECT_SETTINGS_TAB_HASH } from '@/validation-rules/constants/ObjectSettingsTabHash';
import { useNavigateToObjectValidationRules } from '@/validation-rules/hooks/useNavigateToObjectValidationRules';

type SettingsValidationRulePageLayoutProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  breadcrumbLabel: string;
  stepLabel: string;
  isSaveDisabled: boolean;
  onSave: () => void;
  children: ReactNode;
};

export const SettingsValidationRulePageLayout = ({
  objectMetadataItem,
  breadcrumbLabel,
  stepLabel,
  isSaveDisabled,
  onSave,
  children,
}: SettingsValidationRulePageLayoutProps) => {
  const { t } = useLingui();
  const navigateToObjectValidationRules = useNavigateToObjectValidationRules({
    objectNamePlural: objectMetadataItem.namePlural,
  });
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  return (
    <SettingsPageLayout
      title={objectMetadataItem.labelPlural}
      icon={
        <SettingsObjectNewFieldHeaderIcon
          objectMetadataItem={objectMetadataItem}
        />
      }
      titleColor={themeCssVariables.font.color.tertiary}
      links={[
        {
          children: t`Data model`,
          href: getSettingsPath(SettingsPath.Objects),
        },
        {
          children: objectMetadataItem.labelPlural,
          href: getSettingsPath(
            SettingsPath.ObjectDetail,
            { objectNamePlural: objectMetadataItem.namePlural },
            undefined,
            OBJECT_SETTINGS_TAB_HASH,
          ),
        },
        { children: breadcrumbLabel },
      ]}
      actionButton={
        hasAiPermission && (
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconSparkles />}
            onClick={() => openAskAiPage({ resetNavigationStack: true })}
          >{t`Ask AI`}</Button>
        )
      }
      secondaryBar={
        <SettingsWizardStepBar
          label={stepLabel}
          onBack={navigateToObjectValidationRules}
          trailing={
            <Button
              size="sm"
              variant="solid"
              color="accent"
              disabled={isSaveDisabled}
              onClick={onSave}
            >{t`Save`}</Button>
          }
        />
      }
    >
      <SettingsPageContainer>{children}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
