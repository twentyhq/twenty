import { useState } from 'react';

import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { t } from '@lingui/core/macro';
import { H2Title, IconArchive, IconPlug, IconRobot } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import {
  useCreateDatabaseConfigVariableMutation,
  useGetAdminAiModelsQuery,
  useSetAdminAiModelEnabledMutation,
} from '~/generated-metadata/graphql';
import { getModelIcon } from '~/pages/settings/ai/utils/getModelIcon';
import { getModelProviderLabel } from '~/pages/settings/ai/utils/getModelProviderLabel';

export const SettingsAdminAI = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnconfigured, setShowUnconfigured] = useState(false);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const { refetch: refetchClientConfig } = useClientConfig();

  const { data } = useGetAdminAiModelsQuery();
  const [createConfigVariable] = useCreateDatabaseConfigVariableMutation();
  const [setModelEnabled] = useSetAdminAiModelEnabledMutation();

  const autoEnableNewModels =
    data?.getAdminAiModels?.autoEnableNewModels ?? true;

  const models = data?.getAdminAiModels?.models ?? [];

  const handleAutoEnableToggle = async (checked: boolean) => {
    try {
      await createConfigVariable({
        variables: {
          key: 'AI_AUTO_ENABLE_NEW_MODELS',
          value: checked,
        },
        refetchQueries: [{ query: GET_ADMIN_AI_MODELS }],
      });

      await refetchClientConfig();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update auto-enable setting`,
      });
    }
  };

  const handleModelToggle = async (
    modelId: string,
    isCurrentlyEnabled: boolean,
  ) => {
    try {
      await setModelEnabled({
        variables: {
          modelId,
          enabled: !isCurrentlyEnabled,
        },
        refetchQueries: [{ query: GET_ADMIN_AI_MODELS }],
      });

      await refetchClientConfig();
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update model availability`,
      });
    }
  };

  let filteredModels = models;

  if (!showUnconfigured) {
    filteredModels = filteredModels.filter((model) => model.isAvailable);
  }

  if (!showDeprecated) {
    filteredModels = filteredModels.filter((model) => !model.deprecated);
  }

  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();

    filteredModels = filteredModels.filter(
      (model) =>
        model.label.toLowerCase().includes(query) ||
        (model.modelFamily?.toLowerCase().includes(query) ?? false) ||
        model.inferenceProvider.toLowerCase().includes(query),
    );
  }

  const getModelDescription = (
    modelFamily: string | null | undefined,
    isAvailable: boolean,
    isDeprecated: boolean | null | undefined,
  ) => {
    const providerLabel = getModelProviderLabel(modelFamily);

    if (isDeprecated === true) {
      return providerLabel ? t`${providerLabel} — Deprecated` : t`Deprecated`;
    }

    if (!isAvailable) {
      return providerLabel
        ? t`${providerLabel} — API key not configured`
        : t`API key not configured`;
    }

    return providerLabel;
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Admin Model Controls`}
          description={t`Server-wide AI model availability settings`}
        />

        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconRobot}
            title={t`Automatically enable new models`}
            description={t`When enabled, newly added models are available to all workspaces by default`}
            checked={autoEnableNewModels}
            onChange={handleAutoEnableToggle}
          />
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`All Models`}
          description={t`Toggle model availability across all workspaces`}
        />

        <SearchInput
          placeholder={t`Search a model...`}
          value={searchQuery}
          onChange={setSearchQuery}
          filterDropdown={(filterButton) => (
            <Dropdown
              dropdownId="admin-ai-models-filter-dropdown"
              dropdownPlacement="bottom-end"
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={filterButton}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItemToggle
                      LeftIcon={IconPlug}
                      onToggleChange={() =>
                        setShowUnconfigured(!showUnconfigured)
                      }
                      toggled={showUnconfigured}
                      text={t`Unconfigured models`}
                      toggleSize="small"
                    />
                    <MenuItemToggle
                      LeftIcon={IconArchive}
                      onToggleChange={() => setShowDeprecated(!showDeprecated)}
                      toggled={showDeprecated}
                      text={t`Deprecated models`}
                      toggleSize="small"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />

        <Card rounded>
          {filteredModels.map((model, index) => (
            <SettingsOptionCardContentToggle
              key={model.modelId}
              Icon={getModelIcon(model.modelFamily)}
              title={model.label}
              description={getModelDescription(
                model.modelFamily,
                model.isAvailable,
                model.deprecated,
              )}
              checked={model.isAdminEnabled}
              onChange={() =>
                handleModelToggle(model.modelId, model.isAdminEnabled)
              }
              disabled={!model.isAvailable || model.deprecated === true}
              divider={index < filteredModels.length - 1}
            />
          ))}
        </Card>
      </Section>
    </>
  );
};
