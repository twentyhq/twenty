import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useGetToolIndex } from '@/ai/hooks/useGetToolIndex';
import { logicFunctionsSelector } from '@/settings/logic-functions/states/logicFunctionsSelector';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title, IconChevronRight } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { SettingsSystemToolTableRow } from './SettingsSystemToolTableRow';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  TOOL_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsToolTableRow,
} from './SettingsToolTableRow';

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsToolsTable = () => {
  const { theme } = useContext(ThemeContext);
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const { toolIndex, loading: toolIndexLoading } = useGetToolIndex();
  const { t } = useLingui();
  const [customSearchTerm, setCustomSearchTerm] = useState('');
  const [builtInSearchTerm, setBuiltInSearchTerm] = useState('');

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
        <StyledSearchContainer>
          <SearchInput
            placeholder={t`Search a custom tool...`}
            value={customSearchTerm}
            onChange={setCustomSearchTerm}
          />
        </StyledSearchContainer>
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

      </Section>

      <Section>
        <H2Title
          title={t`Built-in`}
          description={t`Standard tools available to AI agents`}
        />
        <StyledSearchContainer>
          <SearchInput
            placeholder={t`Search a built-in tool...`}
            value={builtInSearchTerm}
            onChange={setBuiltInSearchTerm}
          />
        </StyledSearchContainer>
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
