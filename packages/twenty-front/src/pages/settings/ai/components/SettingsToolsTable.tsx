import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { logicFunctionsState } from '@/settings/logic-functions/states/logicFunctionsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
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
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { SettingsSystemToolTableRow } from './SettingsSystemToolTableRow';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsToolTableRow,
} from './SettingsToolTableRow';

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  align-items: center;
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInputContainer = styled.div`
  flex: 1;
  width: 100%;
`;

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsToolsTable = () => {
  const { theme } = useContext(ThemeContext);
  const logicFunctions = useAtomStateValue(logicFunctionsState);
  const { toolIndex, loading: toolIndexLoading } = useGetToolIndex();
  const { createLogicFunction } = usePersistLogicFunction();

  const { t } = useLingui();
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [customSearchTerm, setCustomSearchTerm] = useState('');
  const [builtInSearchTerm, setBuiltInSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const tools = useMemo(
    () => logicFunctions.filter((fn) => fn.isTool === true),
    [logicFunctions],
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

  const systemTools = useMemo(
    () =>
      toolIndex.filter(
        (systemTool) => systemTool.category !== 'LOGIC_FUNCTION',
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

  const showSkeleton = toolIndexLoading && tools.length === 0;

  const handleCreateTool = async () => {
    setIsCreating(true);
    try {
      const result = await createLogicFunction({
        input: {
          name: 'new-tool',
          isTool: true,
        },
      });

      if (result.status === 'successful' && isDefined(result.response?.data)) {
        const newLogicFunction = result.response.data.createOneLogicFunction;
        enqueueSuccessSnackBar({ message: t`Tool created` });

        const applicationId = (newLogicFunction as { applicationId?: string })
          .applicationId;
        if (isDefined(applicationId)) {
          navigate(
            getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
              applicationId,
              logicFunctionId: newLogicFunction.id,
            }),
          );
        } else {
          navigate(
            getSettingsPath(SettingsPath.LogicFunctionDetail, {
              logicFunctionId: newLogicFunction.id,
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
      return getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
        applicationId,
        logicFunctionId: tool.id,
      });
    }
    return getSettingsPath(SettingsPath.LogicFunctionDetail, {
      logicFunctionId: tool.id,
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
          <StyledSearchInputContainer>
            <SettingsTextInput
              instanceId="custom-tool-table-search"
              LeftIcon={IconSearch}
              placeholder={t`Search a custom tool...`}
              value={customSearchTerm}
              onChange={setCustomSearchTerm}
            />
          </StyledSearchInputContainer>
        </StyledSearchAndFilterContainer>
        <Table>
          <StyledTableHeaderRowContainer>
            <TableRow
              gridTemplateColumns={TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
            >
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader align="right">{t`Type`}</TableHeader>
              <TableHeader />
            </TableRow>
          </StyledTableHeaderRowContainer>
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
          <StyledSearchInputContainer>
            <SettingsTextInput
              instanceId="builtin-tool-table-search"
              LeftIcon={IconSearch}
              placeholder={t`Search a built-in tool...`}
              value={builtInSearchTerm}
              onChange={setBuiltInSearchTerm}
            />
          </StyledSearchInputContainer>
        </StyledSearchAndFilterContainer>
        <Table>
          <StyledTableHeaderRowContainer>
            <TableRow
              gridTemplateColumns={TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
            >
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader align="right">{t`Type`}</TableHeader>
              <TableHeader />
            </TableRow>
          </StyledTableHeaderRowContainer>
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
