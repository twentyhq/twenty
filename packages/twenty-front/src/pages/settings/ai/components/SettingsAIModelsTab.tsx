import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { t } from '@lingui/core/macro';
import {
  H2Title,
  IconArchive,
  IconBolt,
  IconFilter,
  IconRobot,
  IconSearch,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';
import { PROVIDER_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import {
  SettingsAIAvailableModelRow,
  StyledModelTableRow,
} from './SettingsAIAvailableModelRow';

const VIRTUAL_MODEL_IDS: Set<string> = new Set([
  DEFAULT_SMART_MODEL,
  DEFAULT_FAST_MODEL,
]);

const StyledSearchInputContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
  width: 100%;
`;

const StyledTableHeaderRow = styled(StyledModelTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAIModelsTab = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const aiModels = useRecoilValueV2(aiModelsState);

  const realModels = aiModels.filter(
    (model) => !VIRTUAL_MODEL_IDS.has(model.modelId),
  );

  const getProviderIcon = (provider: string) =>
    PROVIDER_CONFIG[provider.toUpperCase()]?.Icon ?? IconRobot;

  const defaultModelOptions = realModels
    .filter((model) => !model.deprecated)
    .map((model) => ({
      value: model.modelId,
      label: model.label,
      Icon: getProviderIcon(model.provider),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeprecated, setShowDeprecated] = useState(true);

  const searchNormalized = normalizeSearchText(searchTerm);

  const filteredModels = realModels.filter((model) => {
    if (!normalizeSearchText(model.label).includes(searchNormalized)) {
      return false;
    }

    if (model.deprecated === true && !showDeprecated) {
      return false;
    }

    return true;
  });

  const handleDefaultModelChange = async (value: string) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousSmartModel = currentWorkspace.smartModel;

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        smartModel: value,
      });

      await updateWorkspace({
        variables: {
          input: {
            smartModel: value,
          },
        },
      });

      enqueueSuccessSnackBar({
        message: t`Default model updated successfully`,
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        smartModel: previousSmartModel,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update default model`,
      });
    }
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Default`}
          description={t`Configure your default AI model`}
        />

        <Card rounded>
          <SettingsOptionCardContentSelect
            Icon={IconBolt}
            title={t`Default Model`}
            description={t`Default model for new chats and agents`}
          >
            <Select
              dropdownId="default-model-select"
              value={currentWorkspace?.smartModel ?? ''}
              onChange={handleDefaultModelChange}
              options={defaultModelOptions}
              selectSizeVariant="small"
            />
          </SettingsOptionCardContentSelect>
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`Available`}
          description={t`Models available in the chat model picker`}
        />

        <StyledSearchInputContainer>
          <StyledSearchInput
            instanceId="model-table-search"
            LeftIcon={IconSearch}
            placeholder={t`Search a model...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <Dropdown
            dropdownId="settings-models-filter-dropdown"
            dropdownPlacement="bottom-end"
            dropdownOffset={{ x: 0, y: 8 }}
            clickableComponent={
              <Button
                Icon={IconFilter}
                size="medium"
                variant="secondary"
                accent="default"
                ariaLabel={t`Filter`}
              />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItemToggle
                    LeftIcon={IconArchive}
                    onToggleChange={() => setShowDeprecated(!showDeprecated)}
                    toggled={showDeprecated}
                    text={t`Deprecated`}
                    toggleSize="small"
                  />
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        </StyledSearchInputContainer>

        <Table>
          <StyledTableHeaderRow>
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader align="right">{t`Provider`}</TableHeader>
            <TableHeader />
          </StyledTableHeaderRow>
          {filteredModels.map((model) => (
            <SettingsAIAvailableModelRow key={model.modelId} model={model} />
          ))}
        </Table>
      </Section>
    </>
  );
};
