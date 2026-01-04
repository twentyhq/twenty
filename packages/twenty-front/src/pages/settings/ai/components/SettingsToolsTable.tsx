import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { usePersistServerlessFunction } from '@/settings/serverless-functions/hooks/usePersistServerlessFunction';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { SettingsSystemToolTableRow } from './SettingsSystemToolTableRow';
import {
  SettingsToolTableRow,
  StyledToolTableRow,
} from './SettingsToolTableRow';

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
  width: 100%;
`;

const StyledTableHeaderRow = styled(StyledToolTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const DEFAULT_TOOL_INPUT_SCHEMA = {
  type: 'object',
  properties: {},
};

export const SettingsToolsTable = () => {
  const { serverlessFunctions, loading } = useGetManyServerlessFunctions();
  const { toolIndex, loading: toolIndexLoading } = useGetToolIndex();
  const { createServerlessFunction } = usePersistServerlessFunction();

  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [customSearchTerm, setCustomSearchTerm] = useState('');
  const [builtInSearchTerm, setBuiltInSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Filter to only show serverless functions that are marked as tools
  const tools = useMemo(
    () => serverlessFunctions.filter((fn) => fn.isTool === true),
    [serverlessFunctions],
  );

  const filteredTools = useMemo(
    () =>
      tools.filter((tool) => {
        const searchNormalized = normalizeSearchText(customSearchTerm);
        const matchesSearch =
          normalizeSearchText(tool.name).includes(searchNormalized) ||
          normalizeSearchText(tool.description ?? '').includes(
            searchNormalized,
          );

        return matchesSearch;
      }),
    [tools, customSearchTerm],
  );

  // System tools from the tool index (excluding serverless function tools which are shown separately)
  const systemTools = useMemo(
    () =>
      toolIndex.filter(
        (systemTool) => systemTool.category !== 'SERVERLESS_FUNCTION',
      ),
    [toolIndex],
  );

  const filteredSystemTools = useMemo(
    () =>
      systemTools.filter((systemTool) => {
        const searchNormalized = normalizeSearchText(builtInSearchTerm);
        const matchesSearch =
          normalizeSearchText(systemTool.name).includes(searchNormalized) ||
          normalizeSearchText(systemTool.description).includes(
            searchNormalized,
          );

        return matchesSearch;
      }),
    [systemTools, builtInSearchTerm],
  );

  const showSkeleton = (loading || toolIndexLoading) && tools.length === 0;

  const handleCreateTool = async () => {
    setIsCreating(true);
    try {
      const result = await createServerlessFunction({
        input: {
          name: 'new-tool',
          isTool: true,
          toolInputSchema: DEFAULT_TOOL_INPUT_SCHEMA,
        },
      });

      if (result.status === 'successful' && isDefined(result.response?.data)) {
        const newFunction = result.response.data.createOneServerlessFunction;
        enqueueSuccessSnackBar({ message: t`Tool created` });

        // Navigate to the serverless function detail page
        // The applicationId might be null for workspace-level functions
        const applicationId = (newFunction as { applicationId?: string })
          .applicationId;
        if (isDefined(applicationId)) {
          navigate(
            getSettingsPath(SettingsPath.ApplicationServerlessFunctionDetail, {
              applicationId,
              serverlessFunctionId: newFunction.id,
            }),
          );
        } else {
          navigate(
            getSettingsPath(SettingsPath.ServerlessFunctionDetail, {
              serverlessFunctionId: newFunction.id,
            }),
          );
        }
      }
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to create tool` });
    } finally {
      setIsCreating(false);
    }
  };

  const getToolLink = (tool: (typeof tools)[0]) => {
    const applicationId = (tool as { applicationId?: string }).applicationId;
    if (isDefined(applicationId)) {
      return getSettingsPath(SettingsPath.ApplicationServerlessFunctionDetail, {
        applicationId,
        serverlessFunctionId: tool.id,
      });
    }
    return getSettingsPath(SettingsPath.ServerlessFunctionDetail, {
      serverlessFunctionId: tool.id,
    });
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Custom`}
          description={t`Custom tools created in your workspace`}
        />
        <StyledSearchAndFilterContainer>
          <StyledSearchInput
            instanceId="custom-tool-table-search"
            LeftIcon={IconSearch}
            placeholder={t`Search a custom tool...`}
            value={customSearchTerm}
            onChange={setCustomSearchTerm}
          />
        </StyledSearchAndFilterContainer>
        <Table>
          <StyledTableHeaderRow>
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader align="right">{t`Type`}</TableHeader>
            <TableHeader />
          </StyledTableHeaderRow>
          {showSkeleton
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton height={32} borderRadius={4} key={index} />
              ))
            : filteredTools.map((tool) => (
                <SettingsToolTableRow
                  key={tool.id}
                  tool={tool}
                  action={
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  }
                  link={getToolLink(tool)}
                />
              ))}
        </Table>

        <StyledFooterContainer>
          <Button
            Icon={IconPlus}
            title={t`New Tool`}
            size="small"
            variant="secondary"
            onClick={handleCreateTool}
            disabled={isCreating}
          />
        </StyledFooterContainer>
      </Section>

      <Section>
        <H2Title
          title={t`Built-in`}
          description={t`Standard tools available to AI agents`}
        />
        <StyledSearchAndFilterContainer>
          <StyledSearchInput
            instanceId="builtin-tool-table-search"
            LeftIcon={IconSearch}
            placeholder={t`Search a built-in tool...`}
            value={builtInSearchTerm}
            onChange={setBuiltInSearchTerm}
          />
        </StyledSearchAndFilterContainer>
        <Table>
          <StyledTableHeaderRow>
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader align="right">{t`Type`}</TableHeader>
            <TableHeader />
          </StyledTableHeaderRow>
          {filteredSystemTools.map((systemTool) => (
            <SettingsSystemToolTableRow
              key={systemTool.name}
              tool={systemTool}
            />
          ))}
        </Table>
      </Section>
    </>
  );
};
